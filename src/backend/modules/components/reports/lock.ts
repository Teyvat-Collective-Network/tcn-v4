import { ButtonInteraction } from "discord.js";
import { and, eq } from "drizzle-orm";
import { channels } from "../../../bot.js";
import { db } from "../../../db/db.js";
import tables from "../../../db/tables.js";
import { audit } from "../../../lib/audit.js";
import { renderReportControls } from "../../../lib/reports.js";

export default async function (interaction: ButtonInteraction) {
    const report = await db.query.networkUserReports.findFirst({ columns: { id: true }, where: eq(tables.networkUserReports.message, interaction.message.id) });
    if (!report) throw "Could not fetch this network user report.";

    await interaction.deferUpdate();

    const [{ affectedRows }] = await db
        .update(tables.networkUserReports)
        .set({ status: "locked" })
        .where(and(eq(tables.networkUserReports.id, report.id), eq(tables.networkUserReports.status, "pending")));

    if (affectedRows === 0) throw "This network user report is not pending; your action may have coincided with a slightly earlier one.";

    await interaction.editReply({ components: await renderReportControls(report.id) });

    await channels.observerManagement.send(`${interaction.message.url} was locked by ${interaction.user}.`);
    await audit(interaction.user.id, "reports/lock", null, report.id, [interaction.message.id]);
}
