import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { channels } from "../../bot.js";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { cmdKey, ensureObserver, promptConfirm, template } from "../../lib/bot-lib.js";
import { newPoll, renderPoll } from "../../lib/polls.js";

export default {
    type: ApplicationCommandType.ChatInput,
    name: "poll",
    description: "start a poll",
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "proposal",
            description: "start a proposal vote",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "question",
                    description: "the question / proposal",
                    required: true,
                },
                {
                    type: ApplicationCommandOptionType.Boolean,
                    name: "major",
                    description: "if true, quorum = 75%",
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "selection",
            description: "start a selection vote",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "question",
                    description: "the question (body text)",
                    required: true,
                },
                {
                    type: ApplicationCommandOptionType.Integer,
                    name: "minimum",
                    description: "the minimum number of options a voter must select",
                    required: true,
                    minValue: 1,
                    maxValue: 10,
                },
                {
                    type: ApplicationCommandOptionType.Integer,
                    name: "maximum",
                    description: "the maximum number of options a voter may select",
                    required: true,
                    minValue: 1,
                    maxValue: 10,
                },
                ...new Array(10).fill(0).map(
                    (_, i) =>
                        ({
                            type: ApplicationCommandOptionType.String,
                            name: `option-${i + 1}`,
                            description: `option #${i + 1}`,
                            required: i < 2,
                            maxLength: 100,
                        } as const),
                ),
                {
                    type: ApplicationCommandOptionType.Boolean,
                    name: "major",
                    description: "if true, quorum = 75%",
                },
            ],
        },
    ],
} satisfies ApplicationCommandDataResolvable;

export async function handlePoll(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    await ensureObserver(interaction);

    const key = cmdKey(interaction);

    if (key === "proposal") {
        const question = interaction.options.getString("question", true);
        const major = interaction.options.getBoolean("major") ?? false;
        const res = await promptConfirm(interaction, "Start a proposal vote?");

        await res.update(template.info("Setting up poll..."));

        const { message: poll } = await newPoll(major ? "proposal-major" : "proposal", async (ref) => {
            await db.insert(tables.proposalPolls).values({ ref, question });
            return await channels.voteHere.send(await renderPoll(ref));
        });

        await res.editReply(template.ok(`Voting started: ${poll.url}`));
    } else if (key === "selection") {
        const question = interaction.options.getString("question", true);
        const minimum = interaction.options.getInteger("minimum", true);
        const maximum = interaction.options.getInteger("maximum", true);

        const options = new Array(10)
            .fill(0)
            .map((_, i) => interaction.options.getString(`option-${i + 1}`, i < 2)!)
            .filter((x) => x);

        if (options.length > new Set(options).size) throw "Options must be unique.";

        if (minimum > options.length) throw "Minimum allowed options is greater than the number of options provided.";
        if (minimum > maximum) throw "Minimum is greater than maximum.";

        const major = interaction.options.getBoolean("major") ?? false;

        const res = await promptConfirm(interaction, "Start a selection vote?");

        await res.update(template.info("Setting up poll..."));

        const { message: poll } = await newPoll(major ? "selection-major" : "selection", async (ref) => {
            await db.insert(tables.selectionPolls).values({ ref, question, minimum, maximum, options });
            return await channels.voteHere.send(await renderPoll(ref));
        });

        await res.editReply(template.ok(`Voting started: ${poll.url}`));
    }
}
