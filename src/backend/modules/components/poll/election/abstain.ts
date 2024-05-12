import { ButtonInteraction } from "discord.js";
import { db } from "../../../../db/db.js";
import tables from "../../../../db/tables.js";
import { ensureCouncil, template } from "../../../../lib/bot-lib.js";
import { registerVote, renderPoll, renderVote, verifyTypeAndFetchPollID } from "../../../../lib/polls.js";

export default async function (interaction: ButtonInteraction) {
    await interaction.deferReply({ ephemeral: true });
    await ensureCouncil(interaction);

    const id = await verifyTypeAndFetchPollID(interaction.message.id, "election");

    await db
        .insert(tables.electionVotes)
        .values({ ref: id, user: interaction.user.id, vote: { ranked: [], countered: [] } })
        .onDuplicateKeyUpdate({ set: { vote: { ranked: [], countered: [] } } });

    await registerVote(id, interaction.user.id);

    await interaction.editReply(template.ok(await renderVote(id, interaction.user.id, "election")));

    await interaction.message.edit(await renderPoll(id));
}
