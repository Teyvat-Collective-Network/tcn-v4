import { StringSelectMenuInteraction } from "discord.js";
import { db } from "../../../../db/db.js";
import tables from "../../../../db/tables.js";
import { ensureVoter, template } from "../../../../lib/bot-lib.js";
import { registerVote, renderPoll, renderVote, verifyTypeAndFetchPollID } from "../../../../lib/polls.js";

export default async function (interaction: StringSelectMenuInteraction) {
    await interaction.deferReply({ ephemeral: true });
    await ensureVoter(interaction);

    const id = await verifyTypeAndFetchPollID(interaction.message.id, "selection");

    await db
        .insert(tables.selectionVotes)
        .values({ ref: id, user: interaction.user.id, vote: interaction.values })
        .onDuplicateKeyUpdate({ set: { vote: interaction.values } });

    await registerVote(id, interaction.user.id);

    await interaction.editReply(template.ok(await renderVote(id, interaction.user.id, "selection")));

    await interaction.message.edit(await renderPoll(id));
}
