import "dotenv/config";

import { SnowflakeUtil } from "discord.js";
import { sql } from "drizzle-orm";
import { HQ } from "../backend/bot.ts";
import { db } from "../backend/db/db.ts";
import tables from "../backend/db/tables.ts";
import src, { connect } from "./mongo.ts";

await connect();

console.log("exporting users");

const users = (await src.users.find({ observer: true }).toArray()).map((user) => ({
    id: user.id,
    observer: user.observer,
    observerSince: user.observerSince,
    globalNickname: null,
}));

for (const entry of await src.global_users.find({ nickname: { $ne: null } }).toArray()) {
    let user = users.find((user) => user.id === entry.id);

    if (!user) {
        user = { id: entry.id, observer: false, observerSince: 0 };
        users.push(user);
    }

    user.globalNickname = entry.nickname;
}

await db.delete(tables.users);
await db.insert(tables.users).values(users);

console.log("exporting characters");

const characters = (await src.characters.find().toArray()).map((character) => ({
    id: character.id,
    short: character.short || null,
    name: character.name,
    element: character.attributes.element,
}));

await db.delete(tables.characters);
await db.insert(tables.characters).values(characters);

console.log("exporting guilds");

const hqEntry = await src.rolesync.findOne({ guild: process.env.HQ });
const hubEntry = await src.rolesync.findOne({ guild: process.env.HUB });

const guilds = await Promise.all(
    (
        await src.guilds.find().toArray()
    ).map(async (guild) => {
        try {
            const hqRoleId = hqEntry.apiToRole.find((item) => item.value === "council" && item.guild === guild.id).roles[0];
            const hubRoleId = hubEntry.apiToRole.find((item) => item.value === "staff" && item.guild === guild.id).roles[0];

            const role = await HQ.roles.fetch(hqRoleId);

            return {
                id: guild.id,
                mascot: guild.mascot,
                name: guild.name,
                invite: guild.invite,
                image: "",
                owner: guild.owner,
                advisor: guild.advisor || null,
                delegated: guild.delegated || false,
                roleColor: role.color,
                roleName: role.name,
                hqRole: hqRoleId,
                hubRole: hubRoleId,
            };
        } catch {
            console.log("Failed role import for:", guild.id, guild.name);
        }
    }),
);

await db.delete(tables.guilds);
await db.insert(tables.guilds).values(guilds);

const autostaff = (await src.rolesync.find().toArray())
    .filter((cfg) => guilds.some((guild) => guild.id === cfg.guild))
    .flatMap((cfg) => cfg.roleToStaff.map((role) => ({ guild: cfg.guild, role })));

await db.delete(tables.autoStaffRoles);
await db.insert(tables.autoStaffRoles).values(autostaff);

const staff = (await src.guilds.find().toArray()).flatMap((guild) =>
    Object.entries(guild.users ?? {})
        .filter(([, { staff }]) => staff)
        .map(([user]) => ({ guild: guild.id, user })),
);

await db.delete(tables.forcedStaff);
await db.insert(tables.forcedStaff).values(staff.map((entry) => ({ guild: entry.guild, user: entry.user, staff: true })));
await db.delete(tables.guildStaff);
await db.insert(tables.guildStaff).values(staff);

console.log("exporting reports");

const banshares = (await src.banshares.find().toArray()).sort((x, y) => x.created - y.created);
const reportIdMap = Object.fromEntries(banshares.map((banshare, id) => [banshare.id, id + 1]));

const reports = banshares.map((banshare, id) => ({
    id: id + 1,
    message: banshare.message,
    author: banshare.author,
    display: banshare.ids.slice(0, 1024),
    usernames: "",
    reason: banshare.reason.slice(0, 480),
    evidence: banshare.evidence,
    server: banshare.server,
    category: "banshare",
    urgent: banshare.urgent,
    created: banshare.created,
    reminded: banshare.reminded,
    status: banshare.status,
}));

await db.delete(tables.networkUserReports);
await db.insert(tables.networkUserReports).values(reports);

const reportIds = banshares.flatMap((banshare, ref) => banshare.idList.map((id) => ({ ref: ref + 1, user: id })));

await db.delete(tables.reportIds);
await db.insert(tables.reportIds).values(reportIds);

const reportSettings = (await src.banshare_settings.find().toArray())
    .filter((setting) => guilds.some((guild) => guild.id === setting.guild))
    .map((setting) => ({
        guild: setting.guild,
        channel: setting.channel,
        logs: setting.logs?.[0],
    }));

await db.delete(tables.reportSettings);
await db.insert(tables.reportSettings).values(reportSettings);

const reportCrossposts = banshares.flatMap((banshare, ref) =>
    (banshare.crossposts ?? [])
        .filter((post) => post.guild !== process.env.HUB && guilds.some((guild) => guild.id === post.guild))
        .map((post) => ({ ref: ref + 1, ...post, executor: (banshare.executors ?? {})[post.guild]?.replace(/^1{18}$/, "") || null })),
);

await db.delete(tables.reportCrossposts);
await db.insert(tables.reportCrossposts).values(reportCrossposts);

const reportHubPosts = banshares.flatMap((banshare, ref) =>
    (banshare.crossposts ?? [])
        .filter((post) => post.guild === process.env.HUB)
        .map((post) => ({ ref: ref + 1, channel: post.channel, message: post.message })),
);

await db.delete(tables.reportHubPosts);
await db.insert(tables.reportHubPosts).values(reportHubPosts);

console.log("exporting audit logs");

const auditLogs = [];

for (const entry of await src.audit_logs.find().toArray()) {
    const base = { time: entry.time, actor: entry.user };
    const { data } = entry;

    switch (entry.action) {
        case "guilds/create":
            auditLogs.push({
                ...base,
                type: "guilds/create",
                guild: data.id,
                data: {
                    mascot: data.mascot,
                    name: data.name,
                    invite: data.invite,
                    ownner: data.owner,
                    advisor: data.advisor,
                    delegated: data.delegated,
                    roleColor: 0,
                    roleName: "",
                },
            });
            break;
        case "guilds/delete":
            auditLogs.push({ ...base, type: "guilds/delete", guild: data.id, data: { name: data.name, owner: data.owner, advisor: data.advisor } });
            break;
        case "guilds/edit":
            base.guild = data.id;
            if (
                data.changes.owner &&
                data.changes.advisor &&
                data.changes.owner[0] === data.changes.advisor[1] &&
                data.changes.owner[1] === data.changes.advisor[0]
            )
                auditLogs.push({ ...base, type: "guilds/update/swap-representatives", data: data.changes.advisor });
            else {
                if (data.changes.owner) auditLogs.push({ ...base, type: "guilds/update/owner", data: data.changes.owner });
                if (data.changes.advisor) auditLogs.push({ ...base, type: "guilds/update/advisor", data: data.changes.advisor });
            }
            if (data.changes.delegated) auditLogs.push({ ...base, type: "guilds/update/delegated", data: data.changes.delegated[1] });
            if (data.changes.name) auditLogs.push({ ...base, type: "guilds/update/name", data: data.changes.name });
            break;
        case "banshares/reject":
        case "banshares/publish":
            if (data.message in reportIdMap)
                auditLogs.push({
                    ...base,
                    type: entry.action.replace("banshares", "reports"),
                    data: reportIdMap[data.message],
                    targets: [data.message],
                });
            break;
        case "banshares/rescind":
            if (data.message in reportIdMap)
                auditLogs.push({
                    ...base,
                    type: "reports/rescind",
                    data: { report: reportIdMap[data.message], explanation: entry.reason },
                    targets: [data.message],
                });
            break;
        case "users/promote":
        case "users/demote":
        case "users/term/refresh":
            auditLogs.push({ ...base, type: entry.action.replace("user/term/refresh", "users/refresh-term"), data: data.id, targets: [data.id] });
            break;
    }
}

await db.delete(tables.auditLogs);
await db.insert(tables.auditLogs).values(auditLogs);

console.log("exporting elections");

const elections = (await src.election_history_waves.find().toArray()).map((entry) => ({
    wave: entry.wave,
    channel: "",
    seats: entry.seats,
}));

await db.delete(tables.elections);
await db.insert(tables.elections).values(elections);

const electionHistory = (await src.election_history.find().toArray())
    .filter((entry) => entry.status !== "unknown")
    .map((entry) => ({
        wave: entry.wave,
        user: entry.id,
        status: entry.status.replace("not_elected", "runner-up"),
        rerunning: entry.rerunning,
    }));

await db.delete(tables.electionHistory);
await db.insert(tables.electionHistory).values(electionHistory);

console.log("exporting autosync");

const autosyncSettings = (await src.autosync.find().toArray())
    .filter((setting) => setting.guild !== process.env.HUB && guilds.some((guild) => guild.id === setting.guild))
    .map((setting) => ({
        guild: setting.guild,
        location: setting.webhook ? "webhook" : setting.channel ? "channel" : "disabled",
        channel: setting.channel,
        webhook: setting.webhook,
        message: setting.message,
        report: setting.repost,
    }));

await db.delete(tables.autosyncSettings);
await db.insert(tables.autosyncSettings).values(autosyncSettings);

await db.delete(tables.hubPartnerListLocation);
await db.insert(tables.hubPartnerListLocation).values({ id: 0, message: (await src.autosync.findOne({ guild: process.env.HUB })).message });

console.log("exporting global objects");

const globalChannels = (await src.global_channels.find().toArray()).map((channel) => ({
    id: channel.id,
    name: channel.name,
    visible: channel.public,
    panic: channel.panic,
    infoOnUserPlugin: (channel.plugins ?? []).includes("info-on-user-prompts"),
    logs: channel.logs,
}));

await db.delete(tables.globalChannels);
await db.insert(tables.globalChannels).values(globalChannels);

const globalConnections = (await src.global_connections.find().toArray()).map((connection) => ({
    channel: connection.id,
    guild: connection.guild,
    location: connection.channel,
}));

await db.delete(tables.globalConnections);
await db.insert(tables.globalConnections).values(globalConnections);

const globalFilterTerms = (await src.global_filter.find().toArray()).map((term) => ({
    term: term.match,
    regex: true,
}));

await db.delete(tables.globalFilters);
await db.insert(tables.globalFilters).values({ id: 1, name: "default filter" });

await db.insert(tables.globalFilterTerms).values(globalFilterTerms.map((term, id) => ({ id: id + 1, ...term, filter: 1 })));

const globalMods = (await src.global_channels.find().toArray()).flatMap((channel) => channel.mods.map((mod) => ({ channel: channel.id, user: mod })));

await db.delete(tables.globalMods);
await db
    .insert(tables.globalMods)
    .values(globalMods)
    .onDuplicateKeyUpdate({ set: { channel: sql`channel` } });

const globalBans = (await src.global_channels.find().toArray()).flatMap((channel) => channel.bans.map((ban) => ({ channel: channel.id, user: ban })));

await db.delete(tables.globalBans);
await db
    .insert(tables.globalBans)
    .values(globalBans)
    .onDuplicateKeyUpdate({ set: { channel: sql`channel` } });

const globalWebhookTracker = (await src.global_webhooks.find().toArray()).map((entry) => ({ webhook: entry.id }));

await db.delete(tables.globalWebhookTracker);
await db.insert(tables.globalWebhookTracker).values(globalWebhookTracker);

const globalMessages = [];
const globalMessageInstances = [];

console.log("begin exporting messages");

let id = 0;

await db.delete(tables.globalMessages);
await db.delete(tables.globalMessageInstances);

const total = await src.global_messages.countDocuments();

for await (const message of src.global_messages.find()) {
    if (id % 10000 === 0) {
        console.log(`exporting messages: ${id}/${total}`);
    }

    if (globalMessageInstances.length >= 1000 || globalMessages.length >= 1000) {
        await db.insert(tables.globalMessages).values(globalMessages);
        globalMessages.splice(0, globalMessages.length);
    }

    if (globalMessageInstances.length >= 1000) {
        await db.insert(tables.globalMessageInstances).values(globalMessageInstances);
        globalMessageInstances.splice(0, globalMessageInstances.length);
    }

    id++;

    globalMessages.push({
        id,
        channel: message.id,
        author: message.author,
        originGuild: "",
        originChannel: message.channel,
        originMessage: message.message,
        deleted: !!message.deleted,
        time: Number(SnowflakeUtil.decode(message.message).timestamp),
        content: "",
        username: "",
        replyUsername: "",
        avatar: "",
    });

    for (const instance of message.instances) globalMessageInstances.push({ ref: id, guild: "", channel: instance.channel, message: instance.message });
}

process.exit(0);
