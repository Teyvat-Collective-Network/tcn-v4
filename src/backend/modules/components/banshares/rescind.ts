import { ButtonInteraction, ComponentType, TextInputStyle } from "discord.js";
import { ensureObserver } from "../../../lib/bot-lib.js";

export default async function (interaction: ButtonInteraction) {
    await ensureObserver(interaction);

    await interaction.showModal({
        title: "Rescind Banshare",
        customId: ":banshares/confirm-rescind",
        components: [
            {
                type: ComponentType.ActionRow,
                components: [
                    {
                        type: ComponentType.TextInput,
                        customId: "explanation",
                        style: TextInputStyle.Paragraph,
                        label: "Explanation",
                        maxLength: 1000,
                        required: true,
                    },
                ],
            },
        ],
    });
}
