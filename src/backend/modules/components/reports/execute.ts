import { ButtonInteraction, ButtonStyle, PermissionFlagsBits } from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "../../../db/db.js";
import tables from "../../../db/tables.js";
import { audit } from "../../../lib/audit.js";
import { greyButton, template } from "../../../lib/bot-lib.js";
import { reportActionQueue } from "../../../queue.js";

export default async function (interaction: ButtonInteraction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) throw "Permission denied: you must have permission to ban users.";

    await interaction.deferReply({ ephemeral: true });
    await interaction.message.edit(greyButton("Executed"));

    const report = await db.query.reportCrossposts.findFirst({
        columns: { ref: true },
        where: eq(tables.reportCrossposts.message, interaction.message.id),
    });

    if (!report) throw "Could not find this network user report.";

    await db.update(tables.reportCrossposts).set({ executor: interaction.user.id }).where(eq(tables.reportCrossposts.message, interaction.message.id));

    const entries = await db.query.reportIds.findMany({ columns: { user: true }, where: eq(tables.reportIds.ref, report.ref) });

    await db
        .insert(tables.reportTasks)
        .values(entries.map((entry) => ({ ref: report.ref, guild: interaction.guild!.id, user: entry.user, status: "pending", auto: false } as const)))
        .onDuplicateKeyUpdate({ set: { ref: report.ref } });

    await reportActionQueue.add("", null);

    await interaction.editReply(template.ok("Network user report is being executed. You may dismiss this message."));
    await audit(interaction.user.id, "reports/execute", interaction.guild!.id, report.ref, [interaction.message.id]);
}
