import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { HUB } from "../../bot.js";
import { displayPartnerList } from "../../lib/bot-lib.js";

export default {
    type: ApplicationCommandType.ChatInput,
    name: "partner-list",
    description: "view the TCN partner list",
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "view",
            description: "view the TCN partner list",
            options: [
                {
                    type: ApplicationCommandOptionType.Boolean,
                    name: "public",
                    description: "if true, show the list publicly",
                },
            ],
        },
    ],
} satisfies ApplicationCommandDataResolvable;

export async function handlePartnerList(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: !interaction.options.getBoolean("public") });
    await interaction.editReply(await displayPartnerList(interaction.guildId === HUB.id));
}
