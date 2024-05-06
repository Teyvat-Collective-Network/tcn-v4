import { ButtonInteraction } from "discord.js";
import { ensureCouncil, ensureVoter, template } from "../../../lib/bot-lib.js";
import { renderVote, unrestrictedTypes, verifyTypeAndFetchPollID } from "../../../lib/polls.js";

export default async function (interaction: ButtonInteraction, type: string) {
    await interaction.deferReply({ ephemeral: true });

    if (unrestrictedTypes.includes(type)) await ensureCouncil(interaction);
    else await ensureVoter(interaction);

    await interaction.editReply(template.info(await renderVote(await verifyTypeAndFetchPollID(interaction.message.id, type), interaction.user.id, type)));
}
