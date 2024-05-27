import { BaseMessageOptions, ButtonStyle, ComponentType } from "discord.js";
import { eq, or } from "drizzle-orm";
import bot, { channels } from "../bot.js";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { greyButton, template } from "./bot-lib.js";
import { trackMetrics } from "./metrics.js";

export const categories = { banshare: "Banshare", advisory: "Advisory Report", hacked: "Hacked Account Report" } as const;

export async function renderHQReport(id: number) {
    return await trackMetrics("reports:render-hq-report", async () => {
        return { embeds: await renderReport(id), components: await renderReportControls(id) };
    });
}

export async function renderReport(id: number): Promise<BaseMessageOptions["embeds"]> {
    return await trackMetrics("reports:render-report", async () => {
        const report = await db.query.networkUserReports.findFirst({ where: eq(tables.networkUserReports.id, id) });
        if (!report) return template.error(`Could not fetch report with ID ${id}.`).embeds!;

        const guild = await db.query.guilds.findFirst({ columns: { name: true }, where: eq(tables.guilds.id, report.server) });

        return [
            {
                title: `Network User Report #${id}`,
                color: 0x2b2d31,
                fields: [
                    { name: "ID(s)", value: report.display },
                    report.usernames ? { name: "Username(s)", value: report.usernames } : [],
                    { name: "Reason", value: report.reason },
                    { name: "Evidence", value: report.evidence },
                    {
                        name: "Reported By",
                        value: `<@${report.author}> (${(await bot.users.fetch(report.author).catch(() => null))?.tag ?? "?"}) from ${
                            guild?.name ?? `[unknown guild: \`${report.server}\`]`
                        }`,
                    },
                    report.status === "rejected"
                        ? []
                        : {
                              name: "Category",
                              value: `[${categories[report.category] ?? "[invalid category]"}](${process.env.DOMAIN}/docs/network-user-reports#categories)`,
                          },
                ].flat(),
            },
        ];
    });
}

export async function renderReportControls(id: number): Promise<BaseMessageOptions["components"]> {
    const report = await db.query.networkUserReports.findFirst({ where: eq(tables.networkUserReports.id, id) });
    if (!report) return greyButton("Failed to Fetch Report").components;

    if (report.status === "pending")
        return [
            {
                type: ComponentType.ActionRow,
                components: [
                    { type: ComponentType.Button, customId: ":reports/lock", style: ButtonStyle.Danger, label: "Lock", emoji: "🔒" },
                    { type: ComponentType.Button, customId: ":reports/publish", style: ButtonStyle.Success, label: "Publish" },
                    { type: ComponentType.Button, customId: ":reports/reject", style: ButtonStyle.Danger, label: "Reject" },
                ],
            },
        ];

    if (report.status === "locked")
        return [
            {
                type: ComponentType.ActionRow,
                components: [
                    {
                        type: ComponentType.Button,
                        customId: ":reports/unlock",
                        style: ButtonStyle.Success,
                        label: "Unlock",
                        emoji: "🔓",
                    },
                ],
            },
        ];

    if (report.status === "rejected")
        return [
            {
                type: ComponentType.ActionRow,
                components: [
                    { type: ComponentType.Button, customId: ".", style: ButtonStyle.Danger, label: "Rejected", disabled: true },
                    { type: ComponentType.Button, customId: ":reports/restore", style: ButtonStyle.Primary, label: "Restore" },
                ],
            },
        ];

    if (report.status === "published")
        return [
            {
                type: ComponentType.ActionRow,
                components: [
                    { type: ComponentType.Button, customId: ".", style: ButtonStyle.Success, label: "Published", disabled: true },
                    { type: ComponentType.Button, customId: ":reports/rescind", style: ButtonStyle.Danger, label: "Rescind" },
                ],
            },
        ];

    if (report.status === "rescinded") return greyButton("Rescinded", ButtonStyle.Danger).components;
}

export async function updateReportsDashboard() {
    return await trackMetrics("reports:update-reports-dashboard", async () => {
        const messages = await channels.reportsDashboard.messages.fetch({ limit: 1 }).catch(() => null);

        const reports = await db.query.networkUserReports.findMany({
            columns: { message: true },
            where: or(eq(tables.networkUserReports.status, "pending"), eq(tables.networkUserReports.status, "locked")),
        });

        const text =
            reports.length === 0
                ? "No pending network user reports at this time."
                : `The following network user reports are pending:\n${reports.map((report) => `${channels.reports.url}/${report.message}`).join("\n")}`;

        if (messages)
            try {
                await messages.first()!.edit(text);
                return;
            } catch {}

        messages?.first()?.delete();
        await channels.reportsDashboard.send(text);
    });
}
