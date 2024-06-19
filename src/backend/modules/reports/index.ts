import { ButtonStyle, ComponentType, Events } from "discord.js";
import { and, count, eq, lt, not, or, sql } from "drizzle-orm";
import bot, { channels } from "../../bot.js";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { greyButton } from "../../lib/bot-lib.js";
import { loop } from "../../lib/loop.js";
import { renderHQReport, renderReport, updateReportsDashboard } from "../../lib/reports.js";
import { ReportPublishTask, ReportRescindTask, makeWorker, reportActionQueue } from "../../queue.js";

loop(
    "remind-overdue-reports",
    async () => {
        const [{ overdue }] = await db
            .select({ overdue: count() })
            .from(tables.networkUserReports)
            .where(
                and(
                    eq(tables.networkUserReports.status, "pending"),
                    or(
                        and(eq(tables.networkUserReports.urgent, false), lt(tables.networkUserReports.reminded, Date.now() - 21600000)),
                        and(eq(tables.networkUserReports.urgent, true), lt(tables.networkUserReports.reminded, Date.now() - 7200000)),
                    ),
                ),
            );

        if (overdue === 0) return;

        const [{ affectedRows: pending }] = await db
            .update(tables.networkUserReports)
            .set({ reminded: Date.now() })
            .where(eq(tables.networkUserReports.status, "pending"));

        await channels.observerManagement.send({
            content: `<@&${process.env.ROLE_OBSERVERS}> ${overdue} report${overdue === 1 ? " is" : "s are"} overdue (${pending} total pending). Please visit ${
                channels.reportsDashboard
            } for a list of pending reports.`,
            allowedMentions: { roles: [process.env.ROLE_OBSERVERS!] },
        });
    },
    60000,
);

loop(
    "re-update-reports-dashboard",
    async () => {
        const reports = await db.query.networkUserReports.findMany({
            columns: { id: true, message: true },
            where: or(eq(tables.networkUserReports.status, "pending"), eq(tables.networkUserReports.status, "locked")),
        });

        let updated = false;

        for (const report of reports)
            try {
                const message = await channels.reports.messages.fetch(report.message).catch(() => null);
                if (message) continue;

                const { id } = await channels.reports.send(await renderHQReport(report.id, false));

                await db.update(tables.networkUserReports).set({ message: id }).where(eq(tables.networkUserReports.id, report.id));
                await db.update(tables.auditEntryTargets).set({ target: id }).where(eq(tables.auditEntryTargets.target, report.message));

                updated = true;
            } catch {}

        if (updated) await updateReportsDashboard();
    },
    60000,
);

bot.on(Events.MessageDelete, async (message) => {
    if (message.channel !== channels.reports) return;
    const report = await db.query.networkUserReports.findFirst({
        columns: { id: true, status: true },
        where: eq(tables.networkUserReports.message, message.id),
    });
    if (!report || (report.status !== "pending" && report.status !== "locked")) return;

    const { id } = await channels.reports.send(await renderHQReport(report.id, false));
    await db.update(tables.networkUserReports).set({ message: id }).where(eq(tables.networkUserReports.id, report.id));
    await db.update(tables.auditEntryTargets).set({ target: id }).where(eq(tables.auditEntryTargets.target, message.id));

    await updateReportsDashboard();
});

makeWorker<ReportPublishTask>("report-publish", async ({ id, guild }) => {
    const report = await db.query.networkUserReports.findFirst({
        columns: { id: true, status: true, category: true },
        where: eq(tables.networkUserReports.id, id),
    });

    if (!report || report.status !== "published") return;

    const [settings] = await db
        .select({
            channel: tables.reportSettings.channel,
            logs: tables.reportSettings.logs,
            show:
                report.category === "banshare"
                    ? tables.reportSettings.receiveBanshare
                    : report.category === "advisory"
                    ? tables.reportSettings.receiveAdvisory
                    : report.category === "hacked"
                    ? tables.reportSettings.receiveHacked
                    : sql`false`,
            act: report.category === "banshare" ? tables.reportSettings.autoban : report.category === "hacked" ? tables.reportSettings.autokick : sql`false`,
        })
        .from(tables.reportSettings)
        .where(eq(tables.reportSettings.guild, guild));

    if (!settings || !settings.show || !settings.channel) return;

    const obj = await bot.guilds.fetch(guild).catch(() => null);
    if (!obj) return;

    const channel = await obj.channels.fetch(settings.channel).catch(() => null);
    if (!channel?.isTextBased()) return;

    const message = await channel.send({
        embeds: await renderReport(id),
        components: settings.act
            ? greyButton(report.category === "banshare" ? "Autobanning..." : "Autokicking...").components
            : report.category === "advisory"
            ? []
            : [
                  {
                      type: ComponentType.ActionRow,
                      components: [
                          { type: ComponentType.Button, customId: ":reports/execute", style: ButtonStyle.Danger, label: "Execute" },
                          { type: ComponentType.Button, customId: ":reports/dismiss", style: ButtonStyle.Danger, label: "Dismiss" },
                      ],
                  },
              ],
    });

    await db.insert(tables.reportCrossposts).values({ ref: id, guild, channel: channel.id, message: message.id });

    if (!settings.act) return;

    const entries = await db.query.reportIds.findMany({ columns: { user: true }, where: eq(tables.reportIds.ref, id) });
    const users = entries.map((x) => x.user);

    await db.insert(tables.reportTasks).values(users.map((user) => ({ ref: id, guild, user, status: "pending", auto: true } as const)));

    await reportActionQueue.add("", null);
});

makeWorker("report-action", async () => {
    while (true) {
        const [task] = await db
            .select({
                id: tables.reportTasks.id,
                ref: tables.reportTasks.ref,
                guild: tables.reportTasks.guild,
                user: tables.reportTasks.user,
                auto: tables.reportTasks.auto,
                reason: tables.networkUserReports.reason,
                status: tables.networkUserReports.status,
                category: tables.networkUserReports.category,
                autoban: tables.reportSettings.autoban,
                autokick: tables.reportSettings.autokick,
                autobanMemberThreshold: tables.reportSettings.autobanMemberThreshold,
            })
            .from(tables.reportTasks)
            .innerJoin(tables.networkUserReports, eq(tables.reportTasks.ref, tables.networkUserReports.id))
            .innerJoin(tables.reportSettings, eq(tables.reportTasks.guild, tables.reportSettings.guild))
            .where(eq(tables.reportTasks.status, "pending"))
            .limit(1);

        if (!task) return;

        if (task.auto && task.status === "rescinded")
            await db
                .update(tables.reportTasks)
                .set({ status: "skipped" })
                .where(and(eq(tables.reportTasks.ref, task.ref), eq(tables.reportTasks.guild, task.guild), eq(tables.reportTasks.status, "pending")));
        else
            try {
                const guild = await bot.guilds.fetch(task.guild).catch(() => null);
                if (!guild) throw null;

                let skip = false;

                if (task.category === "banshare" && task.autobanMemberThreshold > 0) {
                    const member = await guild.members.fetch({ user: task.user, force: true }).catch(() => null);
                    if (member && member.joinedTimestamp && Date.now() - member.joinedTimestamp >= task.autobanMemberThreshold) skip = true;
                }

                if (!skip)
                    if (task.category === "banshare") await guild?.bans.create(task.user, { reason: `TCN Banshare: ${task.reason}` });
                    else if (task.category === "hacked") await guild.members.kick(task.user, `TCN Reported Hacked Account: ${task.reason}`);

                await db
                    .update(tables.reportTasks)
                    .set({ status: skip ? "skipped" : "success" })
                    .where(eq(tables.reportTasks.id, task.id))
                    .catch(() => null);
            } catch {
                await db.update(tables.reportTasks).set({ status: "failed" }).where(eq(tables.reportTasks.id, task.id));
            }

        const [{ pending }] = await db
            .select({ pending: count() })
            .from(tables.reportTasks)
            .where(and(eq(tables.reportTasks.ref, task.ref), eq(tables.reportTasks.guild, task.guild), eq(tables.reportTasks.status, "pending")));

        if (pending === 0)
            try {
                const settings = await db.query.reportSettings.findFirst({
                    columns: { channel: true, logs: true },
                    where: eq(tables.reportSettings.guild, task.guild),
                });

                const tasks = await db.query.reportTasks.findMany({
                    columns: { user: true, status: true },
                    where: and(eq(tables.reportTasks.ref, task.ref), eq(tables.reportTasks.guild, task.guild)),
                });

                const crosspost = await db.query.reportCrossposts.findFirst({
                    columns: { channel: true, message: true, executor: true },
                    where: and(eq(tables.reportCrossposts.ref, task.ref), eq(tables.reportCrossposts.guild, task.guild)),
                });

                if (!settings) return;

                const success: string[] = [];
                const skipped: string[] = [];
                const failed: string[] = [];

                for (const task of tasks)
                    if (task.status === "success") success.push(task.user);
                    else if (task.status === "skipped") skipped.push(task.user);
                    else if (task.status === "failed") failed.push(task.user);

                if (crosspost)
                    try {
                        const channel = await bot.channels.fetch(crosspost.channel);
                        if (!channel?.isTextBased()) throw null;

                        const message = await channel.messages.fetch(crosspost.message);

                        await message.edit({
                            components:
                                skipped.length > 0
                                    ? [
                                          {
                                              type: ComponentType.ActionRow,
                                              components: [
                                                  {
                                                      type: ComponentType.Button,
                                                      customId: ":reports/execute",
                                                      style: ButtonStyle.Danger,
                                                      label: `Ban ${skipped.length} Skipped User${skipped.length === 1 ? "" : "s"}`,
                                                  },
                                                  { type: ComponentType.Button, customId: ":reports/dismiss", style: ButtonStyle.Danger, label: "Dismiss" },
                                              ],
                                          },
                                      ]
                                    : greyButton("Automatically Executed").components,
                        });
                    } catch {}

                const prefix = `TCN Report Executed: ${
                    crosspost ? `https://discord.com/channels/${task.guild}/${crosspost.channel}/${crosspost.message}` : "(failed to fetch reference)"
                }\nExecuted by: ${crosspost ? (crosspost.executor ? `<@${crosspost.executor}>` : "Automatic Action") : "(failed to fetch reference)"}`;

                const action = task.category === "banshare" ? "Banned" : "Kicked";

                const text = `${prefix}\n${action}: ${success.map((x) => `<@${x}>`).join(" ") || "N/A"}\nSkipped: ${
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
                                    `${action}: ${success.join(" ") || "N/A"}\nSkipped: ${skipped.join(" ") || "N/A"}\nFailed: ${failed.join(" ") || "N/A"}`,
                                ),
                                name: "report-execution-log.txt",
                            },
                        ],
                    });
            } finally {
                await db
                    .delete(tables.reportTasks)
                    .where(and(eq(tables.reportTasks.ref, task.ref), eq(tables.reportTasks.guild, task.guild), eq(tables.reportTasks.status, "skipped")));

                await db
                    .update(tables.reportTasks)
                    .set({ status: "hold" })
                    .where(and(eq(tables.reportTasks.ref, task.ref), eq(tables.reportTasks.guild, task.guild), not(eq(tables.reportTasks.status, "skipped"))));
            }
    }
});

makeWorker<ReportRescindTask>("report-rescind", async ({ id, explanation, ...data }) => {
    const settings = await db.query.reportSettings.findFirst({
        columns: { channel: true },
        where: eq(tables.reportSettings.guild, data.guild),
    });
    if (!settings?.channel) return;

    const channel = await bot.channels.fetch(settings.channel);
    if (!channel?.isTextBased()) return;

    if (channel.id === data.channel) {
        const message = await channel.messages.fetch(data.message).catch(() => null);
        if (!message) return;

        await message.reply(`This report is being rescinded by an observer. The following explanation was given:\n\n>>> ${explanation}`);
        await message.edit(greyButton("Rescinded", ButtonStyle.Danger)).catch(() => null);
    } else {
        await channel.send(
            `https://discord.com/channels/${data.guild}/${data.channel}/${data.message} is being rescinded by an observer. The following explanation was given:\n\n>>> ${explanation}`,
        );
    }
});
