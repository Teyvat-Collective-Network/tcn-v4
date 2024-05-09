import { Events, Guild, GuildMember, Role } from "discord.js";
import { eq, or } from "drizzle-orm";
import bot, { HQ, HUB, roles } from "../../bot.js";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { loop } from "../../lib/loop.js";
import { fixUserRolesQueue, makeWorker } from "../../queue.js";

async function createRole(color: number, name: string, guild: Guild, anchor: Role, end: Role) {
    const roles = await guild.roles.fetch();

    const position =
        (roles
            .filter((role) => role.position < anchor.position && role.position > end.position)
            .find((role) => role.name.toLowerCase().localeCompare(name.toLowerCase()) > 0)?.position ?? end.position) + 1;

    return await guild.roles.create({ name, color, position });
}

async function createHQRole(color: number, name: string) {
    return await createRole(color, name, HQ, roles.hqMainsAnchor, roles.hqMainsEnd);
}

async function createHubRole(color: number, name: string) {
    return await createRole(color, name, HUB, roles.hubMainsAnchor, roles.hubMainsEnd);
}

async function fixRoles(guild: { id: string; roleColor: number; roleName: string; hqRole: string; hubRole: string; owner: string; advisor: string | null }) {
    let changed = false;
    let changedColor = false;
    let changedName = false;
    let postChangeHQ = false;

    let role = await HQ.roles.fetch(guild.hqRole).catch(() => null);
    let roleInHQ: Role;

    if (!role) {
        role = await createHQRole(guild.roleColor, guild.roleName);
        guild.hqRole = role.id;
        changed = true;
    } else {
        if (role.color !== guild.roleColor) {
            guild.roleColor = role.color;
            changedColor = true;
            changed = true;
        }

        if (role.name !== guild.roleName) {
            guild.roleName = role.name;
            changedName = true;
            changed = true;
        }
    }

    roleInHQ = role;

    role = await HUB.roles.fetch(guild.hubRole).catch(() => null);

    if (!role) {
        role = await createHubRole(guild.roleColor, guild.roleName);
        guild.hubRole = role.id;
        changed = true;
    } else {
        if (!changedColor && role.color !== guild.roleColor) {
            guild.roleColor = role.color;
            postChangeHQ = changed = true;
        }

        if (!changedName && role.name !== guild.roleName) {
            guild.roleName = role.name;
            postChangeHQ = changed = true;
        }
    }

    if (postChangeHQ) await roleInHQ.edit({ color: guild.roleColor, name: guild.roleName });

    if (changed) {
        await db
            .update(tables.guilds)
            .set({ roleColor: guild.roleColor, roleName: guild.roleName, hqRole: guild.hqRole, hubRole: guild.hubRole })
            .where(eq(tables.guilds.id, guild.id));

        await fixUserRolesQueue.add("", guild.owner);
        if (guild.advisor) fixUserRolesQueue.add("", guild.advisor);
    }
}

makeWorker<string>("tcn:fix-guild-roles", async (id) => {
    const guild = await db.query.guilds.findFirst({
        columns: { id: true, roleColor: true, roleName: true, hqRole: true, hubRole: true, owner: true, advisor: true },
        where: eq(tables.guilds.id, id),
    });

    if (guild) await fixRoles(guild);
});

makeWorker<string>("tcn:fix-user-roles", async (id) => {
    const guilds = await db.query.guilds.findMany({
        columns: { id: true, owner: true, advisor: true, delegated: true, hqRole: true, hubRole: true, roleColor: true, roleName: true },
        where: or(eq(tables.guilds.owner, id), eq(tables.guilds.advisor, id)),
    });

    for (const guild of guilds)
        try {
            if (!(await HQ.roles.fetch(guild.hqRole))) throw 0;
            if (!(await HUB.roles.fetch(guild.hubRole))) throw 0;
        } catch {
            await fixRoles(guild);
        }

    const user = await db.query.users.findFirst({ columns: { observer: true }, where: eq(tables.users.id, id) });

    // TODO: global mod role

    const owner = guilds.some((guild) => guild.owner === id);
    const advisor = guilds.some((guild) => guild.advisor === id);
    const voter = guilds.some((guild) => (guild.delegated ? guild.advisor : guild.owner) === id);
    const observer = user?.observer ?? false;
    const staff = !!(await db.query.guildStaff.findFirst({ where: eq(tables.guildStaff.user, id) }));

    const hqMember = await HQ.members.fetch(id).catch(() => null);
    const hubMember = await HUB.members.fetch(id).catch(() => null);

    const hqAdd: string[] = [];
    const hqRemove: string[] = [];
    const hubAdd: string[] = [];
    const hubRemove: string[] = [];

    function check(condition: boolean, hqRole?: string, hubRole?: string) {
        if (condition) {
            if (hqRole) hqAdd.push(hqRole);
            if (hubRole) hubAdd.push(hubRole);
        } else {
            if (hqRole) hqRemove.push(hqRole);
            if (hubRole) hubRemove.push(hubRole);
        }
    }

    check(owner, process.env.ROLE_SERVER_OWNERS, process.env.ROLE_HUB_OWNERS);
    check(advisor, process.env.ROLE_COUNCIL_ADVISORS, process.env.ROLE_HUB_ADVISORS);
    check(voter, process.env.ROLE_VOTERS);
    check(observer, process.env.ROLE_OBSERVERS, process.env.ROLE_HUB_OBSERVERS);
    check(staff, undefined, process.env.ROLE_NETWORK_STAFF);

    for (const guild of guilds) {
        hqAdd.push(guild.hqRole);
        hubAdd.push(guild.hubRole);
    }

    if (hqMember)
        hqRemove.push(
            ...(await HQ.roles.fetch())
                .filter((role) => role.position < roles.hqMainsAnchor.position && role.position > roles.hqMainsEnd.position && !hqAdd.includes(role.id))
                .map((role) => role.id),
        );

    if (hubMember)
        hubRemove.push(
            ...(await HUB.roles.fetch())
                .filter((role) => role.position < roles.hqMainsAnchor.position && role.position > roles.hqMainsEnd.position && !hqAdd.includes(role.id))
                .map((role) => role.id),
        );

    async function resolve(member: GuildMember | null, toAdd: string[], toRemove: string[]) {
        if (!member) return;

        const add = toAdd.filter((role) => !member.roles.cache.has(role));
        if (add.length > 0) await member.roles.add(add);

        const remove = toRemove.filter((role) => member.roles.cache.has(role));
        if (remove.length > 0) await member.roles.remove(remove);
    }

    await resolve(hqMember, hqAdd, hqRemove);
    await resolve(hubMember, hubAdd, hubRemove);
});

loop(async () => {
    const guilds = await db.query.guilds.findMany({
        columns: { id: true, roleColor: true, roleName: true, hqRole: true, hubRole: true, owner: true, advisor: true },
    });

    for (const guild of guilds) await fixRoles(guild).catch(() => null);
}, 3600000);

loop(async () => {
    const users = new Set<string>();

    for (const [id] of await HQ.members.fetch()) users.add(id);
    for (const [id] of await HUB.members.fetch()) users.add(id);

    for (const id of users) await fixUserRolesQueue.add("", id);
}, 86400000);

bot.on(Events.GuildMemberUpdate, async (before, after) => {
    if (after.guild !== HQ && after.guild !== HUB) return;

    const added = after.roles.cache.filter((role) => !before.roles.cache.has(role.id));
    const removed = before.roles.cache.filter((role) => !after.roles.cache.has(role.id));

    const changes = [...added.values(), ...removed.values()];

    if (after.guild === HQ) {
        if (
            changes.some(
                (role) =>
                    [process.env.ROLE_SERVER_OWNERS!, process.env.ROLE_COUNCIL_ADVISORS!, process.env.ROLE_VOTERS!, process.env.ROLE_OBSERVERS!].includes(
                        role.id,
                    ) ||
                    (role.position < roles.hqMainsAnchor.position && role.position > roles.hqMainsEnd.position),
            )
        )
            await fixUserRolesQueue.add("", after.id);
    } else {
        if (
            changes.some(
                (role) =>
                    [
                        process.env.ROLE_HUB_OWNERS!,
                        process.env.ROLE_HUB_ADVISORS!,
                        process.env.ROLE_HUB_OBSERVERS!,
                        process.env.ROLE_NETWORK_STAFF!,
                        process.env.ROLE_HUB_GLOBAL_MODS!,
                    ].includes(role.id) ||
                    (role.position < roles.hubMainsAnchor.position && role.position > roles.hubMainsEnd.position),
            )
        )
            await fixUserRolesQueue.add("", after.id);
    }
});
