import { ButtonStyle, ComponentType, Events } from "discord.js";
import { and, count, eq, lt, not, or } from "drizzle-orm";
import bot, { channels } from "../../bot.js";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { renderBanshare, renderHQBanshare, updateBanshareDashboard } from "../../lib/banshares.js";
import { greyButton } from "../../lib/bot-lib.js";
import { loop } from "../../lib/loop.js";
import { BansharePublishTask, BanshareRescindTask, banshareActionQueue, makeWorker } from "../../queue.js";

loop(async () => {
    const [{ overdue }] = await db
        .select({ overdue: count() })
        .from(tables.banshares)
        .where(
            and(
                eq(tables.banshares.status, "pending"),
                or(
                    and(eq(tables.banshares.urgent, false), lt(tables.banshares.reminded, Date.now() - 21600000)),
                    and(eq(tables.banshares.urgent, true), lt(tables.banshares.reminded, Date.now() - 7200000)),
                ),
            ),
        );

    if (overdue === 0) return;

    const [{ affectedRows: pending }] = await db.update(tables.banshares).set({ reminded: Date.now() }).where(eq(tables.banshares.status, "pending"));

    await channels.execManagement.send({
        content: `<@&${process.env.ROLE_OBSERVERS}> ${overdue} banshare${overdue === 1 ? " is" : "s are"} overdue (${pending} total pending). Please visit ${
            channels.banshareDashboard
        } for a list of pending banshares.`,
        allowedMentions: { roles: [process.env.ROLE_OBSERVERS!] },
    });
}, 60000);

loop(async () => {
    const banshares = await db.query.banshares.findMany({
        columns: { id: true, message: true },
        where: or(eq(tables.banshares.status, "pending"), eq(tables.banshares.status, "locked")),
    });

    let updated = false;

    for (const banshare of banshares)
        try {
            const message = await channels.banshareLogs.messages.fetch(banshare.message).catch(() => null);
            if (message) continue;

            const { id } = await channels.banshareLogs.send(await renderHQBanshare(banshare.id));

            await db.update(tables.banshares).set({ message: id }).where(eq(tables.banshares.id, banshare.id));
            await db.update(tables.auditEntryTargets).set({ target: id }).where(eq(tables.auditEntryTargets.target, banshare.message));

            updated = true;
        } catch {}

    if (updated) await updateBanshareDashboard();
}, 60000);

bot.on(Events.MessageDelete, async (message) => {
    if (message.channel !== channels.banshareLogs) return;
    const banshare = await db.query.banshares.findFirst({ columns: { id: true, status: true }, where: eq(tables.banshares.message, message.id) });
    if (!banshare || (banshare.status !== "pending" && banshare.status !== "locked")) return;

    const { id } = await channels.banshareLogs.send(await renderHQBanshare(banshare.id));
    await db.update(tables.banshares).set({ message: id }).where(eq(tables.banshares.id, banshare.id));
    await db.update(tables.auditEntryTargets).set({ target: id }).where(eq(tables.auditEntryTargets.target, message.id));

    await updateBanshareDashboard();
});

makeWorker<BansharePublishTask>("tcn:banshare-publish", async ({ id, guild }) => {
    const banshare = await db.query.banshares.findFirst({ columns: { id: true, status: true, severity: true }, where: eq(tables.banshares.id, id) });
    if (!banshare || banshare.status !== "published") return;

    const settings = await db.query.banshareSettings.findFirst({ columns: { channel: true, logs: true }, where: eq(tables.banshareSettings.guild, guild) });
    if (!settings?.channel) return;

    const obj = await bot.guilds.fetch(guild).catch(() => null);
    if (!obj) return;

    const channel = await obj.channels.fetch(settings.channel).catch(() => null);
    if (!channel?.isTextBased()) return;

    const actionSettings = await db.query.banshareActionSettings.findMany({
        columns: { member: true, ban: true },
        where: and(eq(tables.banshareActionSettings.guild, guild), eq(tables.banshareActionSettings.severity, banshare.severity)),
    });

    const maybeAutoban = actionSettings.some((x) => x.ban);

    const message = await channel.send({
        embeds: await renderBanshare(id),
        components: maybeAutoban
            ? greyButton("Autobanning...").components
            : [
                  {
                      type: ComponentType.ActionRow,
                      components: [
                          { type: ComponentType.Button, customId: ":banshares/execute", style: ButtonStyle.Danger, label: "Execute" },
                          { type: ComponentType.Button, customId: ":banshares/dismiss", style: ButtonStyle.Danger, label: "Dismiss" },
                      ],
                  },
              ],
    });

    await db.insert(tables.banshareCrossposts).values({ ref: id, guild, channel: channel.id, message: message.id });

    if (!maybeAutoban) return;

    const banMembers = actionSettings.find((x) => x.member)?.ban ?? false;
    const banNonMembers = actionSettings.find((x) => !x.member)?.ban ?? false;

    const entries = await db.query.banshareIds.findMany({ columns: { user: true }, where: eq(tables.banshareIds.ref, id) });
    const users = entries.map((x) => x.user);

    const member = banMembers ? (banNonMembers ? null : true) : false;

    await db.insert(tables.banTasks).values(users.map((user) => ({ ref: id, guild, user, status: "pending", member, autoban: true }) as const));

    await banshareActionQueue.add("", null);
});

makeWorker("tcn:banshare-action", async () => {
    while (true) {
        const [task] = await db
            .select({
                id: tables.banTasks.id,
                ref: tables.banTasks.ref,
                guild: tables.banTasks.guild,
                user: tables.banTasks.user,
                member: tables.banTasks.member,
                autoban: tables.banTasks.autoban,
                reason: tables.banshares.reason,
                status: tables.banshares.status,
            })
            .from(tables.banTasks)
            .innerJoin(tables.banshares, eq(tables.banTasks.ref, tables.banshares.id))
            .where(eq(tables.banTasks.status, "pending"))
            .limit(1);

        if (!task) return;

        if (task.autoban && task.status === "rescinded")
            await db
                .update(tables.banTasks)
                .set({ status: "skipped" })
                .where(and(eq(tables.banTasks.ref, task.ref), eq(tables.banTasks.guild, task.guild), eq(tables.banTasks.status, "pending")));
        else
            try {
                const guild = await bot.guilds.fetch(task.guild).catch(() => null);
                if (!guild) throw null;

                let skip = false;

                if (task.member !== null) {
                    const member = await guild.members.fetch({ user: task.user, force: true }).catch(() => null);
                    if ((member !== null) !== task.member) skip = true;
                }

                if (!skip) await guild?.bans.create(task.user, { reason: `TCN Banshare: ${task.reason}` });

                await db
                    .update(tables.banTasks)
                    .set({ status: skip ? "skipped" : "banned" })
                    .where(eq(tables.banTasks.id, task.id))
                    .catch(() => null);
            } catch {
                await db.update(tables.banTasks).set({ status: "failed" }).where(eq(tables.banTasks.id, task.id));
            }

        const [{ pending }] = await db
            .select({ pending: count() })
            .from(tables.banTasks)
            .where(and(eq(tables.banTasks.ref, task.ref), eq(tables.banTasks.guild, task.guild), eq(tables.banTasks.status, "pending")));

        if (pending === 0)
            try {
                const settings = await db.query.banshareSettings.findFirst({
                    columns: { channel: true, logs: true },
                    where: eq(tables.banshareSettings.guild, task.guild),
                });

                const tasks = await db.query.banTasks.findMany({
                    columns: { user: true, status: true },
                    where: and(eq(tables.banTasks.ref, task.ref), eq(tables.banTasks.guild, task.guild)),
                });

                const crosspost = await db.query.banshareCrossposts.findFirst({
                    columns: { channel: true, message: true, executor: true },
                    where: and(eq(tables.banshareCrossposts.ref, task.ref), eq(tables.banshareCrossposts.guild, task.guild)),
                });

                if (!settings) return;

                const banned: string[] = [];
                const skipped: string[] = [];
                const failed: string[] = [];

                for (const task of tasks)
                    if (task.status === "banned") banned.push(task.user);
                    else if (task.status === "skipped") skipped.push(task.user);
                    else if (task.status === "failed") failed.push(task.user);

                if (skipped.length > 0 && crosspost)
                    try {
                        const channel = await bot.channels.fetch(crosspost.channel);
                        if (!channel?.isTextBased()) throw null;

                        const message = await channel.messages.fetch(crosspost.message);

                        await message.edit({
                            components: [
                                {
                                    type: ComponentType.ActionRow,
                                    components: [
                                        {
                                            type: ComponentType.Button,
                                            customId: ":banshares/execute",
                                            style: ButtonStyle.Danger,
                                            label: `Ban ${skipped.length} Skipped User${skipped.length === 1 ? "" : "s"}`,
                                        },
                                        { type: ComponentType.Button, customId: ":banshares/dismiss", style: ButtonStyle.Danger, label: "Dismiss" },
                                    ],
                                },
                            ],
                        });
                    } catch {}

                const prefix = `TCN Banshare Executed: ${
                    crosspost ? `https://discord.com/channels/${task.guild}/${crosspost.channel}/${crosspost.message}` : "(failed to fetch reference)"
                }\nExecuted by: ${crosspost ? (crosspost.executor ? `<@${crosspost.executor}>` : "Autoban") : "(failed to fetch reference)"}`;

                const text = `${prefix}\nBanned: ${banned.map((x) => `<@${x}>`).join(" ") || "N/A"}\nSkipped: ${
                    skipped.map((x) => `<@${x}>`).join(" ") || "N/A"
                }\nFailed: ${failed.map((x) => `<@${x}>`).join(" ") || "N/A"}`;

                let channel = settings.logs ? await bot.channels.fetch(settings.logs).catch(() => null) : null;
                if (!channel && settings.channel) channel = await bot.channels.fetch(settings.channel).catch(() => null);

                if (!channel?.isTextBased()) return;

                if (text.length < 2000) await channel.send(text);
                else
                    await channel.send({
                        content: prefix,
                        files: [
                            {
                                attachment: Buffer.from(
                                    `Banned: ${banned.join(" ") || "N/A"}\nSkipped: ${skipped.join(" ") || "N/A"}\nFailed: ${failed.join(" ") || "N/A"}`,
                                ),
                                name: "banshare-execution-log.txt",
                            },
                        ],
                    });
            } finally {
                await db
                    .delete(tables.banTasks)
                    .where(and(eq(tables.banTasks.ref, task.ref), eq(tables.banTasks.guild, task.guild), eq(tables.banTasks.status, "skipped")));

                await db
                    .update(tables.banTasks)
                    .set({ status: "hold" })
                    .where(and(eq(tables.banTasks.ref, task.ref), eq(tables.banTasks.guild, task.guild), not(eq(tables.banTasks.status, "skipped"))));
            }
    }
});

makeWorker<BanshareRescindTask>("tcn:banshare-rescind", async ({ id, explanation, ...data }) => {
    const settings = await db.query.banshareSettings.findFirst({ columns: { channel: true }, where: eq(tables.banshareSettings.guild, data.guild) });
    if (!settings?.channel) return;

    const channel = await bot.channels.fetch(settings.channel);
    if (!channel?.isTextBased()) return;

    if (channel.id === data.channel) {
        const message = await channel.messages.fetch(data.message).catch(() => null);
        if (!message) return;

        await message.reply(`This banshare is being rescinded by an observer. The following explanation was given:\n\n>>> ${explanation}`);
        await message.edit(greyButton("Rescinded", ButtonStyle.Danger)).catch(() => null);
    } else {
        await channel.send(
            `https://discord.com/channels/${data.guild}/${data.channel}/${data.message} is being rescinded by an observer. The following explanation was given:\n\n>>> ${explanation}`,
        );
    }
});
