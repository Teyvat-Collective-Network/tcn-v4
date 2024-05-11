import {
    ApplicationCommandDataResolvable,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChannelType,
    ChatInputCommandInteraction,
    escapeMarkdown,
} from "discord.js";
import { eq } from "drizzle-orm";
import { channels } from "../../bot.js";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { applicationThreadStatusToTag, applicationThreadTagToStatus } from "../../lib/applications.js";
import { audit } from "../../lib/audit.js";
import { cmdKey, ensureObserver, promptConfirm, template } from "../../lib/bot-lib.js";
import { newPoll, reloadApplicationPolls, renderPoll } from "../../lib/polls.js";

export default {
    type: ApplicationCommandType.ChatInput,
    name: "application",
    description: "manage applications",
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "start-vote",
            description: "start a vote for this application",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "vote",
                    description: "the type of vote to start",
                    required: true,
                    choices: [
                        { name: "Decline Observation & Reject", value: "decline-observation" },
                        { name: "Cancel Ongoing Observation & Reject", value: "cancel-observation" },
                        { name: "Induction (Standard)", value: "induction/normal" },
                        { name: "Induction (Unconfirmed Character)", value: "induction/pre-approve" },
                        { name: "Induction (Tiebreak Induct / Pre-Approve)", value: "induction/positive-tiebreak" },
                        { name: "Induction (Tiebreak Reject / Extend)", value: "induction/negative-tiebreak" },
                    ],
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "rename",
            description: "change this applicant's name",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "name",
                    description: "the new name",
                    required: true,
                    maxLength: 80,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "nuke",
            description: "nuke this application permanently and delete the thread",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "reason",
                    description: "why this application is being nuked",
                    required: true,
                    maxLength: 1024,
                },
            ],
        },
    ],
} satisfies ApplicationCommandDataResolvable;

const errorInvalidThread = "This is not an application thread.";

export async function handleApplication(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    await ensureObserver(interaction);

    const thread = interaction.channel;

    if (!thread?.isThread() || thread.parent !== channels.applicants || thread.parent.type !== ChannelType.GuildForum) throw errorInvalidThread;

    const application = await db.query.applications.findFirst({ where: eq(tables.applications.thread, thread.id) });
    if (!application) throw errorInvalidThread;

    if (thread.appliedTags.length !== 1) throw "This thread is in an invalid state. Please fix the tags (there should be exactly one).";

    const state = applicationThreadTagToStatus[thread.appliedTags[0]];

    const key = cmdKey(interaction);

    if (key === "start-vote") {
        const type = interaction.options.getString("vote", true);
        let success = false;

        if (type === "decline-observation") {
            if (state === "voting-to-decline") throw "The council is already voting to decline observing this applicant.";
            if (state !== "pending") throw "This application is no longer pending.";

            const res = await promptConfirm(
                interaction,
                `Start a vote to reject **${escapeMarkdown(application.name)}** (\`${
                    application.guild
                }\`)?\n- This will initialize a two-day, minor, restricted vote to reject the server without observing them.\n- If a vote to decline observation already failed, you cannot run another one.`,
            );

            await res.update(template.info("Setting up vote..."));

            try {
                const { ref, message } = await newPoll("decline-observation", async (ref) => {
                    await db.insert(tables.applicationPolls).values({ ref, thread: thread.id });
                    return await channels.voteHere.send(await renderPoll(ref));
                });

                await res.editReply(template.ok(`Poll #${ref} posted: ${message.url}`));

                thread.setAppliedTags([applicationThreadStatusToTag["voting-to-decline"]]);

                channels.logs.send(
                    `A vote to decline observation for **[${escapeMarkdown(application.name)}](<${application.url}>)** was started by ${interaction.user}.`,
                );

                thread.send(`A vote to decline observation for this applicant has been started. Please vote [here](<${message.url}>).`);

                success = true;
            } catch (error) {
                await res.editReply(template.error(`Error setting up vote: ${error}`));
                console.error(error);
            }
        } else if (type === "cancel-observation") {
            if (state === "voting-to-cancel") throw "The council is already voting to cancel this applicant's observation.";
            if (state !== "observing") throw "This applicant is not under observation.";

            const res = await promptConfirm(
                interaction,
                `Start a vote to cancel observation for and reject **${escapeMarkdown(application.name)}** (\`${
                    application.guild
                }\`)?\n- This will initialize a two-day, minor, restricted vote to reject the server, canceling their ongoing observation.\n- If a vote to cancel observation already failed, you **can** run another one.`,
            );

            await res.update(template.info("Setting up vote..."));

            try {
                const { ref, message } = await newPoll("cancel-observation", async (ref) => {
                    await db.insert(tables.applicationPolls).values({ ref, thread: thread.id });
                    return await channels.voteHere.send(await renderPoll(ref));
                });

                await res.editReply(template.ok(`Poll #${ref} posted: ${message.url}`));

                thread.setAppliedTags([applicationThreadStatusToTag["voting-to-cancel"]]);

                channels.logs.send(
                    `A vote to cancel the ongoing observation for **[${escapeMarkdown(application.name)}](<${application.url}>)** was started by ${
                        interaction.user
                    }.`,
                );

                thread.send(`A vote to cancel the ongoing observation for this applicant has been started. Please vote [here](<${message.url}>).`);

                success = true;
            } catch (error) {
                await res.editReply(template.error(`Error setting up vote: ${error}`));
                console.error(error);
            }
        } else if (type.startsWith("induction/")) {
            const mode = type.slice(10);

            if (state === "voting") throw "The council is already voting on this server's induction.";
            if (state !== "observing" && state !== "observation-finished")
                throw "This applicant is not in the right state (should be observing or observation finished).";

            const res = await promptConfirm(
                interaction,
                `Start an induction vote for **${escapeMarkdown(application.name)}** (\`${
                    application.guild
                }\`)?\n- This will initialize a two-day, minor, restricted vote for the server.\n${
                    {
                        normal: "- This will be a normal induction vote with options to induct, reject, and extend observation.",
                        "pre-approve":
                            "- This will be an induction vote with the standard options to induct, reject, and extend observation and the option to pre-approve the server.\n- This poll type only applies for servers whose mascot character is not a confirmed playable character yet.",
                        "positive-tiebreak":
                            "- This will be a tiebreaker vote between inducting and pre-approving.\n- This poll type only applies for servers whose mascot character is not a confirmed playable character and whose initial vote tied between these two options.",
                        "negative-tiebreak":
                            "- This will be a tiebreaker vote between rejecting and extending observation.\n- This poll type only applies for servers whose initial vote tied between these two options.",
                    }[mode]
                }`,
            );

            await res.update(template.info("Setting up vote..."));

            try {
                const { ref, message } = await newPoll("induction", async (ref) => {
                    await db.insert(tables.applicationPolls).values({ ref, thread: thread.id });
                    await db.insert(tables.inductionPolls).values({ ref, mode: mode as any });
                    return await channels.voteHere.send(await renderPoll(ref));
                });

                await res.editReply(template.ok(`Poll #${ref} posted: ${message.url}`));

                thread.setAppliedTags([applicationThreadStatusToTag.voting]);

                channels.logs.send(`A vote for **[${escapeMarkdown(application.name)}](<${application.url}>)** was started by ${interaction.user}.`);

                thread.send(`A vote for this applicant has been started. Please vote [here](<${message.url}>).`);

                success = true;
            } catch (error) {
                await res.editReply(template.error(`Error setting up vote: ${error}`));
                console.error(error);
            }
        }

        if (success) await audit(interaction.user.id, "applications/vote", application.guild, type);
    } else if (key === "nuke") {
        const reason = interaction.options.getString("reason", true);

        const res = await promptConfirm(
            interaction,
            "Nuke this application thread? This action is irreversible and should only be done if the application is erroneous (e.g. a duplicate was submitted or it was submitted by accident without completing the form) or abusive. Do not do this to invalid applications (i.e. ones where the server is not eligible); those should be kept around for records.",
        );

        await res.update(template.info("Nuking application..."));

        try {
            await db.delete(tables.applications).where(eq(tables.applications.thread, thread.id));
            thread.delete();

            channels.logs.send({
                content: `An application submitted by <@${application.user}> for **${escapeMarkdown(application.name)}** (\`${
                    application.guild
                }\`) was nuked by ${interaction.user} with the following reason: ${reason}`,
                embeds: [
                    {
                        title: "Application Data Record",
                        color: 0x2b2d31,
                        fields: [
                            { name: "Experience", value: application.experience || "N/A" },
                            { name: "Goals", value: application.goals || "N/A" },
                            { name: "History", value: application.history || "N/A" },
                            { name: "Additional", value: application.additional || "N/A" },
                        ],
                    },
                ],
            });

            await audit(interaction.user.id, "applications/nuke", application.guild, { reason, application });
        } catch (error) {
            await res.editReply(template.error(`Error nuking application: ${error}`));
            console.error(error);
        }
    } else if (key === "rename") {
        const name = interaction.options.getString("name", true);

        await db.update(tables.applications).set({ name }).where(eq(tables.applications.thread, thread.id));
        await thread.setName(name);

        reloadApplicationPolls(thread.id);

        await interaction.editReply(template.ok("Renamed this applicant."));
        await audit(interaction.user.id, "applications/rename", application.guild, [application.name, name]);
    }
}
