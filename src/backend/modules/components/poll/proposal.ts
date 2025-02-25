import { ButtonInteraction } from "discord.js";
import { db } from "../../../db/db.js";
import tables from "../../../db/tables.js";
import { ensureVoter, template } from "../../../lib/bot-lib.js";
import { registerVote, renderPoll, renderVote, verifyTypeAndFetchPollID } from "../../../lib/polls.js";

export default async function (interaction: ButtonInteraction, vote: string, subclass: "major" | "minor") {
    const major = subclass === "major";
    const type = major ? "proposal-major" : "proposal";

    await interaction.deferReply({ ephemeral: true });
    await ensureVoter(interaction);

    const id = await verifyTypeAndFetchPollID(interaction.message.id, type);

    await db
        .insert(tables.proposalVotes)
        .values({ ref: id, user: interaction.user.id, vote: vote as any })
        .onDuplicateKeyUpdate({ set: { vote: vote as any } });

    await registerVote(id, interaction.user.id);

    await interaction.editReply(template.ok(await renderVote(id, interaction.user.id, type)));

    await interaction.message.edit(await renderPoll(id));
}
