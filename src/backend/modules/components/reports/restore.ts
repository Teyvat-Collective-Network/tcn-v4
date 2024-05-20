import { ButtonInteraction } from "discord.js";
import { and, eq } from "drizzle-orm";
import { channels } from "../../../bot.js";
import { db } from "../../../db/db.js";
import tables from "../../../db/tables.js";
import { audit } from "../../../lib/audit.js";
import { ensureObserver } from "../../../lib/bot-lib.js";
import { renderReportControls, updateReportsDashboard } from "../../../lib/reports.js";

export default async function (interaction: ButtonInteraction) {
    await ensureObserver(interaction);

    const report = await db.query.networkUserReports.findFirst({ columns: { id: true }, where: eq(tables.networkUserReports.message, interaction.message.id) });
    if (!report) throw "Could not fetch this network user report.";

    await interaction.deferUpdate();

    const [{ affectedRows }] = await db
        .update(tables.networkUserReports)
        .set({ status: "pending", reminded: Date.now() })
        .where(and(eq(tables.networkUserReports.id, report.id), eq(tables.networkUserReports.status, "rejected")));

    if (affectedRows === 0) throw "This network user report is no longer rejected.";

    await interaction.editReply({ components: await renderReportControls(report.id) });

    await channels.logs.send(`${interaction.message.url} was restored by ${interaction.user}.`);
    await audit(interaction.user.id, "reports/restore", null, report.id, [interaction.message.id]);

    updateReportsDashboard();
}
