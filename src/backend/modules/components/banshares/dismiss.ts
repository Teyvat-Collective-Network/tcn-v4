import { ButtonInteraction, PermissionFlagsBits } from "discord.js";

export default async function (interaction: ButtonInteraction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) throw "Permission denied: you must have permission to ban users.";

    await interaction.update({ components: [] });
}
