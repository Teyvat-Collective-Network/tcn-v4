import { ButtonInteraction } from "discord.js";
import { and, eq, isNotNull } from "drizzle-orm";
import { channels } from "../../../bot.js";
import { db } from "../../../db/db.js";
import tables from "../../../db/tables.js";
import { audit } from "../../../lib/audit.js";
import { ensureObserver, promptConfirm, template } from "../../../lib/bot-lib.js";
import { renderReport, renderReportControls, updateReportsDashboard } from "../../../lib/reports.js";
import { reportPublishQueue } from "../../../queue.js";

export default async function (interaction: ButtonInteraction) {
    await ensureObserver(interaction);

    const report = await db.query.networkUserReports.findFirst({ columns: { id: true }, where: eq(tables.networkUserReports.message, interaction.message.id) });
    if (!report) throw "Could not fetch this network user report.";

    const res = await promptConfirm(interaction, "Publish this network user report?");
    await res.update(template.info("Publishing network user report..."));

    const [{ affectedRows }] = await db
        .update(tables.networkUserReports)
        .set({ status: "published" })
        .where(and(eq(tables.networkUserReports.id, report.id), eq(tables.networkUserReports.status, "pending")));

    if (affectedRows === 0) return void res.editReply(template.error("This network user report is no longer pending."));

    await interaction.message.edit({ components: await renderReportControls(report.id) });

    await channels.logs.send(`${interaction.message.url} was published by ${interaction.user}.`);

    await res.editReply(
        template.ok(
            "This network user report is being published. You may dismiss this message. Rescinding it will cancel unfinished publication / autoban tasks.",
        ),
    );

    try {
        const message = await channels.hubReports.send({ embeds: await renderReport(report.id) });
        await db.insert(tables.reportHubPosts).values({ ref: report.id, channel: channels.hubReports.id, message: message.id });
    } catch (error) {
        channels.logs.send(`<@&${process.env.ROLE_TECH_TEAM}> Failed to publish network user report to the TCN Hub: ${error}`);
        console.error(error);
    }

    const settings = await db.query.reportSettings.findMany({ columns: { guild: true }, where: isNotNull(tables.reportSettings.channel) });
    await reportPublishQueue.addBulk(settings.map((setting) => ({ name: "", data: { id: report.id, guild: setting.guild } })));
    await audit(interaction.user.id, "reports/publish", null, report.id, [interaction.message.id]);

    updateReportsDashboard();
}
