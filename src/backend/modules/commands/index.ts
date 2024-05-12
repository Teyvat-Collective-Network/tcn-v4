import { Events } from "discord.js";
import bot, { HQ, HUB, channels } from "../../bot.js";
import { reply, template } from "../../lib/bot-lib.js";
import admin, { handleAdmin } from "./admin.js";
import application, { handleApplication } from "./application.js";
import banshares, { handleBanshares } from "./banshares.js";
import elections, { handleElectionMarkAsStatement, handleElections } from "./elections.js";
import polls, { handlePoll } from "./polls.js";
import staff, { handleStaff } from "./staff.js";
import testing, { handleTesting } from "./testing.js";

await bot.application.commands.set([banshares, staff, admin]);
await HQ.commands.set([application, ...elections, ...testing, polls]);
await HUB.commands.set([]);

bot.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    try {
        if (interaction.isChatInputCommand()) {
            switch (interaction.commandName) {
                case "application":
                    await handleApplication(interaction);
                    break;
                case "banshares":
                    await handleBanshares(interaction);
                    break;
                case "election":
                    await handleElections(interaction);
                    break;
                case "testing":
                    await handleTesting(interaction);
                    break;
                case "staff":
                    await handleStaff(interaction);
                    break;
                case "poll":
                    await handlePoll(interaction);
                    break;
                case "admin":
                    await handleAdmin(interaction);
                    break;
                default:
                    throw "Unrecognized command; it may not yet be implemented.";
            }
        } else if (interaction.isMessageContextMenuCommand()) {
            switch (interaction.commandName) {
                case "Mark As Statement":
                    await handleElectionMarkAsStatement(interaction);
                    break;
            }
        }
    } catch (error) {
        if (typeof error === "string") await reply(interaction, template.error(error));
        else if (error !== null) {
            await reply(interaction, template.error("An unexpected error occurred. This issue has been logged."));
            const uuid = crypto.randomUUID();
            console.error(uuid);
            console.error(error);
            channels.logs.send(
                `<@&${process.env.ROLE_TECH_TEAM}> An error occurred handling \`${interaction.isChatInputCommand() ? "/" : ""}${
                    interaction.commandName
                }\` (logged under \`${uuid}\`).`,
            );
        }
    }
});
