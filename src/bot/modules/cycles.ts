import crypto from "crypto";
import { ButtonStyle, ChannelType, Client, ComponentType, Message } from "discord.js";
import { api } from "../api.js";
import { banshareComponents, updateBanshareDashboard } from "../banshares.js";
import { channels } from "../bot.js";
import { logBanshareExecutionIfDone } from "./cycles/lib.js";

let bot: Client<true>;

async function banshareCrosspost() {
    while (true) {
        const task = await api.getOneBanshareCrosspostTask.query().catch(() => null);
        if (!task) return setTimeout(banshareCrosspost, 5000);

        let message: Message | undefined;

        try {
            if (!task.channel) continue;

            const autoban = (task.autoban ?? {}) as Record<string, [boolean, boolean]>;

            const guild = await bot.guilds.fetch(task.guild).catch(() => {
                throw "Could not fetch server.";
            });

            const channel = await guild.channels.fetch(task.channel).catch(() => {
                throw "Could not fetch channel.";
            });

            if (!channel) throw "Could not fetch channel.";
            if (channel.type !== ChannelType.GuildText) throw "Invalid channel type.";

            const maybeAutoban = (autoban[task.severity] ?? []).some((x) => x);

            message = await channel.send({
                embeds: [
                    {
                        title: "Banshare",
                        color: 0x2b2d31,
                        fields: [
                            { name: "ID(s)", value: task.idDisplay },
                            task.usernameDisplay ? { name: "Username(s)", value: task.usernameDisplay } : [],
                            { name: "Reason", value: task.reason },
                            { name: "Evidence", value: task.evidence },
                            {
                                name: "Submitted By",
                                value: `<@${task.author}> (${(await bot.users.fetch(task.author).catch(() => null))?.tag}) from ${task.name}`,
                            },
                            { name: "Severity", value: task.severity },
                        ].flat(),
                    },
                ],
                components: maybeAutoban
                    ? []
                    : [
                          {
                              type: ComponentType.ActionRow,
                              components: [
                                  { type: ComponentType.Button, customId: "banshare-execute", style: ButtonStyle.Danger, label: "Execute" },
                                  { type: ComponentType.Button, customId: "banshare-dismiss", style: ButtonStyle.Secondary, label: "Dismiss" },
                              ],
                          },
                      ],
            });

            if (maybeAutoban)
                await api.addBanTasks.mutate({
                    guild: task.guild,
                    message: task.message,
                    users: task.ids,
                    member: autoban[task.severity][0] ? (autoban[task.severity][1] ? null : false) : true,
                });
        } catch (e) {
            channels.logs.send(`Error publishing banshare to guild \`${task.guild}\`: ${e}`);
        } finally {
            await api.completeBanshareCrosspostTask.mutate({
                id: task.id,
                origin: task.message,
                guild: task.guild,
                channel: message?.channelId ?? null,
                message: message?.id ?? null,
            });
        }
    }
}

async function runBanTask() {
    while (true) {
        const task = await api.getOneBanTask.query().catch(() => null);
        if (!task) return setTimeout(runBanTask, 5000);

        let status: "banned" | "skipped" | "errored" = "banned";

        try {
            const guild = await bot.guilds.fetch(task);

            if (task.member !== null) {
                const member = await guild.members.fetch({ user: task.user, force: true }).catch(() => null);
                const isMember = member !== null;

                if (isMember !== task.member) {
                    status = "skipped";
                    continue;
                }
            }

            await guild.bans.create(task.user, { reason: `TCN Banshare: ${task.reason}` });

            if (task.daedalus) {
                const g = task.guild;
                const u = task.user;
                const r = `TCN Banshare: ${task.reason}`;
                const o = `https://discord.com/channels/${task.guild}/${task.channel}/${task.location}`;
                const i = bot.user.id;
                const h = crypto.createHmac("sha256", process.env.DDL_HMAC!).update([g, u, r, o, i].join(" ")).digest().toString("base64url");

                fetch(`${process.env.DDL_ROOT}/api/ext/tcn/banshare?${new URLSearchParams({ g, u, r, o, i, h })}`, { method: "POST" });
            }
        } catch {
            status = "errored";
        } finally {
            await api.completeBanTask.mutate({ id: task.id, status });
            await logBanshareExecutionIfDone(task.guild, task.message);
        }
    }
}

async function logRescindedBanshare() {
    while (true) {
        const task = await api.getOneRescindedBanshareLogTask.query().catch(() => null);
        if (!task) return setTimeout(logRescindedBanshare, 5000);

        await logBanshareExecutionIfDone(task.guild, task.message);
        await api.completeRescindedBanshareLogTask.mutate(task.id);
    }
}

async function repostDeletedPendingBansharesAndUpdateDashboard() {
    const banshares = await api.getPendingBansharesFull.query().catch(() => null);

    for (const banshare of banshares ?? [])
        try {
            const message = await channels.banshareLogs.messages.fetch(banshare.message).catch(() => null);
            if (message !== null) continue;

            const { id } = await channels.banshareLogs.send({
                embeds: [
                    {
                        title: "Banshare",
                        color: 0x2b2d31,
                        fields: [
                            { name: "ID(s)", value: banshare.idDisplay },
                            banshare.usernameDisplay ? { name: "Username(s)", value: banshare.usernameDisplay } : [],
                            { name: "Reason", value: banshare.reason },
                            { name: "Evidence", value: banshare.evidence },
                            {
                                name: "Submitted By",
                                value: `<@${banshare.author}> (${(await bot.users.fetch(banshare.author).catch(() => null))?.tag}) from ${await api.getGuildName
                                    .query(banshare.guild)
                                    .catch(() => null)}`,
                            },
                            { name: "Severity", value: banshare.severity },
                        ].flat(),
                    },
                ],
                components: banshareComponents(banshare.severity, banshare.locked, "pending"),
            });

            await api.setBanshareMessage.mutate({ original: banshare.message, updated: id });
            banshare.message = id;
        } catch {}

    if (banshares) await updateBanshareDashboard(banshares);

    setTimeout(repostDeletedPendingBansharesAndUpdateDashboard, 60000);
}

export default function (client: Client<true>) {
    bot = client;

    banshareCrosspost();
    runBanTask();
    logRescindedBanshare();
    repostDeletedPendingBansharesAndUpdateDashboard();
}
