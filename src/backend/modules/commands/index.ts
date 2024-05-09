import { Events } from "discord.js";
import bot, { HQ, HUB, channels } from "../../bot.js";
import { reply, template } from "../../lib/bot-lib.js";
import application, { handleApplication } from "./application.js";
import banshares, { handleBanshares } from "./banshares.js";

await bot.application.commands.set([banshares]);
await HQ.commands.set([application]);
await HUB.commands.set([]);

bot.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
        try {
            switch (interaction.commandName) {
                case "application":
                    await handleApplication(interaction);
                    break;
                case "banshares":
                    await handleBanshares(interaction);
                    break;
                default:
                    throw "Unrecognized command; it may not yet be implemented.";
            }
        } catch (error) {
            if (typeof error === "string") await reply(interaction, template.error(error));
            else if (error !== null) {
                await reply(interaction, template.error("An unexpected error occurred. This issue has been logged."));
                const uuid = crypto.randomUUID();
                console.error(uuid);
                console.error(error);
                channels.logs.send(`An error occurred handling \`/${interaction.commandName}\` (logged under \`${uuid}\`).`);
            }
        }
    }
});
