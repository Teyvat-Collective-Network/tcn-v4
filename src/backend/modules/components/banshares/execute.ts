import { ButtonInteraction, ButtonStyle, PermissionFlagsBits } from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "../../../db/db.js";
import tables from "../../../db/tables.js";
import { greyButton, template } from "../../../lib/bot-lib.js";
import { banshareActionQueue } from "../../../queue.js";

export default async function (interaction: ButtonInteraction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) throw "Permission denied: you must have permission to ban users.";

    await interaction.deferReply({ ephemeral: true });
    await interaction.message.edit(greyButton("Executed", ButtonStyle.Danger));

    const banshare = await db.query.banshareCrossposts.findFirst({
        columns: { ref: true },
        where: eq(tables.banshareCrossposts.message, interaction.message.id),
    });

    if (!banshare) throw "Could not find this banshare.";

    await db.update(tables.banshareCrossposts).set({ executor: interaction.user.id }).where(eq(tables.banshareCrossposts.message, interaction.message.id));

    const entries = await db.query.banshareIds.findMany({ columns: { user: true }, where: eq(tables.banshareIds.ref, banshare.ref) });

    await db
        .insert(tables.banTasks)
        .values(entries.map((entry) => ({ ref: banshare.ref, guild: interaction.guild!.id, user: entry.user, status: "pending" } as const)))
        .onDuplicateKeyUpdate({ set: { ref: banshare.ref } });

    await banshareActionQueue.add("", null);

    await interaction.editReply(template.ok("Banshare is being executed. You may dismiss this message."));
}
