import { StringSelectMenuInteraction } from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "../../../../db/db.js";
import tables from "../../../../db/tables.js";
import { ensureObserver, ensureVoter, template } from "../../../../lib/bot-lib.js";
import { registerVote, renderPoll, renderVote, verifyTypeAndFetchPollID } from "../../../../lib/polls.js";

export default async function (interaction: StringSelectMenuInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const [vote] = interaction.values;

    if (vote === "add-preapprove" || vote === "remove-preapprove") {
        await ensureObserver(interaction);
        const id = await verifyTypeAndFetchPollID(interaction.message.id, "induction");

        await db
            .update(tables.inductionPolls)
            .set({ mode: vote === "add-preapprove" ? "pre-approve" : "normal" })
            .where(eq(tables.inductionPolls.ref, id));

        await interaction.message.edit(await renderPoll(id));

        await interaction.editReply(template.ok("Poll edited."));

        return;
    }

    await ensureVoter(interaction);

    const id = await verifyTypeAndFetchPollID(interaction.message.id, "induction");

    await db
        .insert(tables.inductionVotes)
        .values({ ref: id, user: interaction.user.id, vote: vote as any })
        .onDuplicateKeyUpdate({ set: { vote: vote as any } });

    await registerVote(id, interaction.user.id);

    await interaction.editReply(template.ok(await renderVote(id, interaction.user.id, "induction")));

    await interaction.message.edit(await renderPoll(id));
}
