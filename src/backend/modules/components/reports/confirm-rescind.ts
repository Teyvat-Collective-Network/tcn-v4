import { ModalSubmitInteraction } from "discord.js";
import { and, eq, not } from "drizzle-orm";
import { HUB, channels } from "../../../bot.js";
import { db } from "../../../db/db.js";
import tables from "../../../db/tables.js";
import { audit } from "../../../lib/audit.js";
import { ensureObserver, template } from "../../../lib/bot-lib.js";
import { renderReportControls } from "../../../lib/reports.js";
import { reportRescindQueue } from "../../../queue.js";

export default async function (interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ ephemeral: true });
    await ensureObserver(interaction);

    const report = await db.query.networkUserReports.findFirst({
        columns: { id: true },
        where: eq(tables.networkUserReports.message, interaction.message!.id),
    });
    if (!report) throw "Could not fetch this network user report.";

    const [{ affectedRows }] = await db
        .update(tables.networkUserReports)
        .set({ status: "rescinded" })
        .where(and(eq(tables.networkUserReports.id, report.id), eq(tables.networkUserReports.status, "published")));

    if (affectedRows === 0) throw "This network user report has already been rescinded.";

    const explanation = interaction.fields.getTextInputValue("explanation");

    await interaction.editReply(template.ok("This network user report is being rescinded. You may dismiss this message."));
    channels.logs.send(`${interaction.message?.url} was rescinded by ${interaction.user}.`);

    try {
        await interaction.message!.reply(
            `This network user report is being rescinded by an observer. The following explanation was given:\n\n>>> ${explanation}`,
        );

        await interaction.message!.edit({ components: await renderReportControls(report.id) });
    } catch {}

    try {
        const entry = await db.query.reportHubPosts.findFirst({
            columns: { channel: true, message: true },
            where: eq(tables.reportHubPosts.ref, report.id),
        });

        if (!entry) throw "Hub network user report crosspost could not be fetched.";

        if (entry.channel !== channels.hubReports.id)
            await channels.hubReports.send(
                `https://discord.com/channels/${HUB.id}/${entry.channel}/${entry.message} is being rescinded by an observer. The following explanation was given:\n\n>>> ${explanation}`,
            );
        else {
            const message = await channels.hubReports.messages.fetch(entry.message);
            await message.reply(`This network user report is being rescinded by an observer. The following explanation was given:\n\n>>> ${explanation}`);
        }
    } catch (error) {
        channels.logs.send(`<@&${process.env.ROLE_TECH_TEAM}> Failed to send rescind notice to the TCN Hub: ${error}`);
        console.error(error);
    }

    const posts = await db.query.reportCrossposts.findMany({
        columns: { guild: true, channel: true, message: true },
        where: and(eq(tables.reportCrossposts.ref, report.id), not(eq(tables.reportCrossposts.guild, HUB.id))),
    });

    await reportRescindQueue.addBulk(
        posts.map((post) => ({ name: "", data: { id: report.id, guild: post.guild, channel: post.channel, message: post.message, explanation } })),
    );

    await audit(interaction.user.id, "reports/rescind", null, { report: report.id, explanation }, [interaction.message!.id]);
}
