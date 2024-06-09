import { ApplicationCommandDataResolvable, ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { HQ, channels } from "../../bot.js";

export default {
    type: ApplicationCommandType.ChatInput,
    name: "invite",
    description: "generate a one-use one-week invite to HQ",
} satisfies ApplicationCommandDataResolvable;

export async function handleInvite(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const invite = await HQ.invites.create(HQ.rulesChannel!, { maxAge: 604800, maxUses: 1, unique: true });
    await interaction.editReply(invite.url);
    await channels.logs.send(`One-week one-use invite created by ${interaction.user}.`);
}
