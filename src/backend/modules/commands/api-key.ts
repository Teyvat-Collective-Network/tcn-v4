import { ApplicationCommandDataResolvable, ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import jwt from "jsonwebtoken";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";

export default {
    type: ApplicationCommandType.ChatInput,
    name: "api-key",
    description: "reset and output your API key",
} satisfies ApplicationCommandDataResolvable;

export async function handleAPIKey(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const salt = crypto.randomUUID();
    const token = jwt.sign({ user: interaction.user.id, time: Date.now(), salt }, process.env.JWT_SECRET!);
    await db.insert(tables.apiKeys).values({ user: interaction.user.id, token }).onDuplicateKeyUpdate({ set: { token } });
    await interaction.editReply(
        `Your new API token is \`${token}\`. Any applications using your old token (if any) will immediately no longer work. Keep this token safe! It has access to everything you do.`,
    );
}
