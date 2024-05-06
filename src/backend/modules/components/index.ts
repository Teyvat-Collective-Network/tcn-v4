import { Events } from "discord.js";
import bot, { channels } from "../../bot.js";
import { reply, template } from "../../lib/bot-lib.js";

bot.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
        if (!interaction.customId.startsWith(":")) return;

        try {
            const [_, key, ...args] = interaction.customId.split(":");

            const { default: handler } = await import(`./${key}`).catch(() => ({ default: null }));
            if (!handler) throw `Unrecognized interaction; it may not yet be implemented or the handler is broken. (ID: \`${interaction.customId}\`)`;

            await handler(interaction, ...args);
        } catch (error) {
            if (typeof error === "string") await reply(interaction, template.error(error));
            else if (error !== null) {
                await reply(interaction, template.error("An unexpected error occurred. This issue has been logged."));
                const uuid = crypto.randomUUID();
                console.error(uuid);
                console.error(error);
                channels.logs.send(`An error occurred handling interaction (custom ID: \`${interaction.customId}\`) (logged under \`${uuid}\`).`);
            }
        }
    }
});
