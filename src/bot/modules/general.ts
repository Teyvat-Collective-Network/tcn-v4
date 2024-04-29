import { ButtonStyle, Client, ComponentType, Events } from "discord.js";

export default function (bot: Client<true>) {
    bot.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isButton() && interaction.customId === "cancel") {
            await interaction.update({
                content: null,
                embeds: [],
                files: [],
                components: [
                    {
                        type: ComponentType.ActionRow,
                        components: [{ type: ComponentType.Button, customId: ".", style: ButtonStyle.Secondary, label: "Canceled", disabled: true }],
                    },
                ],
            });
        }
    });
}
