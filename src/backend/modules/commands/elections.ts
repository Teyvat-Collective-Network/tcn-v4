import {
    ApplicationCommandDataResolvable,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    Channel,
    ChannelType,
    ChatInputCommandInteraction,
    Message,
    MessageContextMenuCommandInteraction,
    ThreadAutoArchiveDuration,
} from "discord.js";
import { and, eq } from "drizzle-orm";
import { channels, roles } from "../../bot.js";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { englishList, timeinfo } from "../../lib.js";
import { cmdKey, ensureObserver, promptConfirm, template } from "../../lib/bot-lib.js";
import { electionThreadTagToStatus } from "../../lib/elections.js";
import { newPoll, renderPoll } from "../../lib/polls.js";

export default [
    {
        type: ApplicationCommandType.ChatInput,
        name: "election",
        description: "manage elections",
        options: [
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "start",
                description: "start an election",
                options: [
                    {
                        type: ApplicationCommandOptionType.Integer,
                        name: "wave",
                        description: "the election wave",
                        required: true,
                        minValue: 1,
                    },
                    {
                        type: ApplicationCommandOptionType.Integer,
                        name: "seats",
                        description: "the number of available positions",
                        required: true,
                        minValue: 1,
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "short-reason",
                        description: "a short reason for the election",
                        required: true,
                        maxLength: 500,
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "long-reason",
                        description: "a long reason for the election",
                        required: true,
                        maxLength: 500,
                    },
                ],
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "set-as-declined",
                description: "set a user as having declined their nomination",
                options: [
                    {
                        type: ApplicationCommandOptionType.User,
                        name: "user",
                        description: "the user to set as declined",
                        required: true,
                    },
                ],
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "set-as-nominated",
                description: "set a user as having been nominated without yet declining or accepting",
                options: [
                    {
                        type: ApplicationCommandOptionType.User,
                        name: "user",
                        description: "the user to set as nominated",
                        required: true,
                    },
                ],
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "start-voting",
                description: "start the voting phase",
            },
        ],
    },
    {
        type: ApplicationCommandType.Message,
        name: "Mark As Statement",
    },
] satisfies ApplicationCommandDataResolvable[];

async function getAndVerifyThread(channel: Channel | null) {
    const thread = channel;
    if (!thread?.isThread() || thread.parent !== channels.elections || thread.parent.type !== ChannelType.GuildForum) throw "This is not an election thread.";

    const election = await db.query.elections.findFirst({ columns: { wave: true }, where: eq(tables.elections.channel, thread.id) });
    if (!election) throw "This is not an election thread.";

    return { thread, election };
}

export async function handleElections(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    await ensureObserver(interaction);

    const key = cmdKey(interaction);

    if (key === "start") {
        const wave = interaction.options.getInteger("wave", true);
        const seats = interaction.options.getInteger("seats", true);
        const shortReason = interaction.options.getString("short-reason", true);
        const longReason = interaction.options.getString("long-reason", true);

        if (!!(await db.query.elections.findFirst({ where: eq(tables.elections.wave, wave) }))) throw `The wave ${wave} election already exists.`;

        const topText = `# Election Information\n**Wave:** ${wave}\n**Seats:** ${seats}\n**Reason:** ${shortReason}\n**Window:** Nominations are scheduled for ${timeinfo(
            Date.now(),
        )} to ${timeinfo(Date.now() + 604800000)}`;

        const mainText = `Another wave of felections is upon us! ${longReason}\n\nPlease nominate people who you would like to be candidates for the upcoming election. Please try to avoid repeating nominations to avoid clutter. Additionally, you are welcome to nominate yourself.\n\nNominations and statements will be open until ${timeinfo(
            Date.now() + 604800000,
        )}. If you are nominated, please either indicate that you wish to decline your nomination or provide a campaign statement (there is no required format for this; it is just an opportunity to advertise yourself as a candidate) in this channel.\n\n**Important:** To discuss things related to the election or elections in general, please use the pinned discussion post and keep this channel strictly for nominations, statements, and declining.\n\nThank you!`;

        const res = await promptConfirm(
            interaction,
            `Confirm starting an election? Here's a quick preview of the information:\n\n${topText}\n\n# Preview: Main Content\n${mainText}`,
        );

        await res.update(template.info("Starting election..."));

        try {
            const thread = await channels.elections.threads.create({
                name: `Wave ${wave} Election`,
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
                message: { content: topText },
                appliedTags: [process.env.TAG_ELECTION_NOMINATING!],
            });

            await thread.send(mainText);
            await thread.send({ content: `${roles.hqOwners}`, allowedMentions: { roles: [roles.hqOwners.id] } });
            await thread.send({
                content: `${roles.hqAdvisors} (you are welcome to nominate others and yourself; you will also be expected to vote during the election)`,
                allowedMentions: { roles: [roles.hqAdvisors.id] },
            });

            await db.insert(tables.elections).values({ wave, channel: thread.id, seats });
            await res.editReply(template.ok(`Election started: ${thread}.`));

            channels.logs.send(`The wave ${wave} election was started by ${interaction.user}: ${thread}.`);
        } catch (error) {
            await res.editReply(template.error(`Failed to start election: ${error}`));
        }

        return;
    }

    const { thread, election } = await getAndVerifyThread(interaction.channel);

    if (thread.appliedTags.length !== 1) throw "This thread is in an invalid state. Please fix the tags (there should be exactly one).";
    const state = electionThreadTagToStatus[thread.appliedTags[0]];

    if (key === "set-as-declined" || key === "set-as-nominated") {
        if (state !== "nominating") throw "This election is no longer in the nominating phase.";

        const status = key === "set-as-declined" ? "declined" : "nominated";

        const user = interaction.options.getUser("user", true).id;
        const rerunning = (await db.query.users.findFirst({ columns: { observer: true }, where: eq(tables.users.id, user) }))?.observer ?? false;

        await db.insert(tables.electionHistory).values({ wave: election.wave, user, rerunning, status }).onDuplicateKeyUpdate({ set: { status } });
        await db.delete(tables.electionStatements).where(and(eq(tables.electionStatements.wave, election.wave), eq(tables.electionStatements.user, user)));

        await interaction.editReply(
            template.ok(
                `Set <@${user}> as having ${status === "declined" ? "declined their nomination" : "been nominated without yet declining or accepting"}.`,
            ),
        );
    } else if (key === "start-voting") {
        if (state !== "nominating") throw "This election is no longer in the nominating phase.";

        const candidates = await db.query.electionHistory.findMany({
            columns: { user: true, status: true },
            where: eq(tables.electionHistory.wave, election.wave),
        });

        const nominated: string[] = [];
        const accepted: string[] = [];
        const declined: string[] = [];

        for (const candidate of candidates)
            if (candidate.status === "nominated") nominated.push(candidate.user);
            else if (candidate.status === "accepted") accepted.push(candidate.user);
            else if (candidate.status === "declined") declined.push(candidate.user);

        if (nominated.length > 0)
            throw `The following ${nominated.length === 1 ? "user has" : "users have"} not had their statement${
                nominated.length === 1 ? "" : "s"
            } marked or been indicated as declining: ${englishList(nominated.map((id) => `<@${id}>`))}.`;

        const res = await promptConfirm(
            interaction,
            `Start the voting phase of the election with ${englishList(accepted.map((id) => `<@${id}>`))} as candidates? ${
                declined.length > 0
                    ? `${englishList(declined.map((id) => `<@${id}>`))} ${declined.length === 1 ? "was" : "were"} indicated as having declined.`
                    : ""
            }`,
        );

        await res.deferReply({ ephemeral: true });

        const statements = await db.query.electionStatements.findMany({ where: eq(tables.electionStatements.wave, election.wave) });
        const messages: Message[] = [];

        for (const statement of statements) {
            const message = await thread.messages.fetch(statement.message).catch(() => null);

            if (!message)
                return void res.editReply(template.error(`Failed to fetch the statement message for ${statement.user}. Please re-mark their statement.`));

            messages.push(message);
        }

        const { message: poll } = await newPoll("election", async (ref) => {
            await db.insert(tables.electionPolls).values({ ref, thread: thread.id, candidates: accepted });
            return await channels.voteHere.send(await renderPoll(ref));
        });

        for (const message of messages) await message.pin().catch(() => null);

        await thread.send({
            embeds: [
                {
                    title: "Election Candidate Statements",
                    description: `In no particular order:\n\n${messages.map((message) => `- <@${message.author.id}>: ${message.url}`).join("\n")}`,
                },
            ],
        });

        await thread.setAppliedTags([process.env.TAG_ELECTION_VOTING!]);

        await res.editReply(template.ok(`Voting started: ${poll.url}`));
    }
}

export async function handleElectionMarkAsStatement(interaction: MessageContextMenuCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    await ensureObserver(interaction);

    const { thread, election } = await getAndVerifyThread(interaction.channel);

    if (thread.appliedTags.length !== 1) throw "This thread is in an invalid state. Please fix the tags (there should be exactly one).";
    const state = electionThreadTagToStatus[thread.appliedTags[0]];

    if (state !== "nominating") throw "This election is no longer in the nominating phase.";

    await db
        .insert(tables.electionHistory)
        .values({ wave: election.wave, user: interaction.targetMessage.author.id, rerunning: false, status: "accepted" })
        .onDuplicateKeyUpdate({ set: { status: "accepted" } });

    await db
        .insert(tables.electionStatements)
        .values({ wave: election.wave, user: interaction.targetMessage.author.id, message: interaction.targetId })
        .onDuplicateKeyUpdate({ set: { message: interaction.targetId } });

    await interaction.editReply(template.ok(`Marked ${interaction.targetMessage.author} as having accepted their nomination and saved their statement.`));
}
