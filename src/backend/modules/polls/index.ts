import { Queue, Worker } from "bullmq";
import { ChannelType, Events } from "discord.js";
import { and, eq, inArray, lt } from "drizzle-orm";
import bot, { channels } from "../../bot.js";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { getQuorum, getVoters } from "../../lib/api-lib.js";
import { applicationThreadStatusToTag } from "../../lib/applications.js";
import { loop } from "../../lib/loop.js";
import { getDeclineObservationResults, renderPoll, unrestrictedTypes } from "../../lib/polls.js";
import { DMReminderTask, dmReminderQueue, qoptions } from "../../queue.js";

// DM Reminders
loop(async function () {
    const polls = await db.query.polls.findMany({ columns: { id: true, type: true, message: true }, where: lt(tables.polls.reminder, Date.now()) });
    if (polls.length === 0) return;

    let voters: string[];
    let council: string[];

    for (const { id, type, message } of polls)
        try {
            const required = unrestrictedTypes.includes(type) ? (council ??= await getVoters(true)) : (voters ??= await getVoters(false));

            const found = new Set(
                (await db.query.voteTracker.findMany({ columns: { user: true }, where: eq(tables.voteTracker.poll, id) })).map((item) => item.user),
            );

            const users = required.filter((user) => !found.has(user));
            if (users.length === 0) continue;

            const url = `${channels.voteHere.url}/${message}`;
            await dmReminderQueue.addBulk(users.map((user) => ({ name: "", data: { id, url, user } })));

            await db.update(tables.polls).set({ reminder: null }).where(eq(tables.polls.id, id));

            await channels.logs.send(`Queued ${users.length} DM reminder${users.length === 1 ? "" : "s"} for [poll #${id}](<${url}>).`);
        } catch (error) {
            channels.logs.send(`Error queueing DM reminders for poll #${id}: ${error}`);
            console.error(error);
        }
}, 10000);

new Worker<DMReminderTask>(
    "tcn:dm-reminders",
    async ({ data: { id, url, user } }) => {
        const link = `[poll #${id}](<${url}>)`;

        try {
            await (await bot.users.fetch(user)).send(`You have not voted on ${link} yet. Please do so at your earliest convenience.`);
            channels.logs.send(`Sent a reminder to <@${user}> to vote on ${link}.`);
        } catch {
            await channels.logs.send(`Error reminding <@${user}> to vote on ${link}. Pinging them in ${channels.voteHere}.`);

            await channels.voteHere.send({
                content: `<@${user}> Please vote on ${link}. (Enable DMs in this server to receive these reminders as DMs instead.)`,
                allowedMentions: { users: [user] },
            });
        }
    },
    qoptions,
);

// Close Polls
loop(async () => {
    const polls = await db.query.polls.findMany({
        columns: { id: true, message: true, type: true },
        where: and(lt(tables.polls.deadline, Date.now()), eq(tables.polls.trulyClosed, false)),
    });

    if (polls.length === 0) return;

    await db
        .update(tables.polls)
        .set({ closed: true })
        .where(
            inArray(
                tables.polls.id,
                polls.map((poll) => poll.id),
            ),
        );

    for (const { id, message, type } of polls)
        try {
            const msg = await channels.voteHere.messages.fetch(message);
            await msg.edit(await renderPoll(id));
            await db.update(tables.polls).set({ trulyClosed: true }).where(eq(tables.polls.id, id));

            const link = `[poll #${id}](<${msg.url}>)`;
            channels.logs.send(`Closed ${link}.`);

            if (["decline-observation"].includes(type))
                try {
                    const data = await db.query.applicationPolls.findFirst({ columns: { thread: true }, where: eq(tables.applicationPolls.ref, id) });
                    if (!data) throw "Could not fetch application poll data.";

                    const channel = await bot.channels.fetch(data.thread);
                    if (!channel?.isThread() || channel.parent?.type !== ChannelType.GuildForum || channel.parent !== channels.applicants)
                        throw "Found invalid applicant thread.";

                    const valid = await getQuorum(id, type);

                    if (type === "decline-observation")
                        if (valid) {
                            const { verdict } = await getDeclineObservationResults(id);

                            await channel.setAppliedTags([
                                verdict === "decline" ? applicationThreadStatusToTag.rejected : applicationThreadStatusToTag.pending,
                            ]);

                            await channel.send(
                                {
                                    decline: `The council voted to reject this applicant without observation: ${msg.url}`,
                                    proceed: `The council voted to proceed with observing this applicant: ${msg.url}`,
                                    tie: `The council voted on rejecting this applicant without observation but reached a tie: ${msg.url}`,
                                }[verdict],
                            );
                        } else {
                            await channel.setAppliedTags([applicationThreadStatusToTag.pending]);
                            await channel.send(`The council did not reach quorum on whether to reject this applicant without observation: ${msg.url}`);
                        }
                } catch (error) {
                    channels.logs.send(`Error resolving application status for ${link}. Please fix this manually. Error: ${error}`);
                    console.error(error);
                }
        } catch (error) {
            channels.logs.send(`Error closing poll #${id}: ${error}`);
            console.error(error);
        }
}, 10000);

async function repostDeletedOpenPolls() {
    const polls = await db.query.polls.findMany({ where: eq(tables.polls.trulyClosed, false) });

    for (const { message, ...poll } of polls) {
        if (!!(await channels.voteHere.messages.fetch(message).catch(() => null))) continue;

        try {
            const newMessage = await channels.voteHere.send(await renderPoll(poll.id));
            await db.update(tables.polls).set({ message: newMessage.id }).where(eq(tables.polls.id, poll.id));

            channels.logs.send({
                content: `<@&${process.env.ROLE_TECH_TEAM}> Recreated deleted [poll #${poll.id}](<${newMessage.url}>).`,
                allowedMentions: { roles: [process.env.ROLE_TECH_TEAM!] },
            });
        } catch (error) {
            channels.logs.send({
                content: `<@&${process.env.ROLE_TECH_TEAM}> Error recreating deleted poll. Details provided below. Error: ${error}`,
                files: [{ name: "dump.json", attachment: Buffer.from(JSON.stringify(poll)) }],
                allowedMentions: { roles: [process.env.ROLE_TECH_TEAM!] },
            });

            console.error(error);
        }
    }
}

const queue = new Queue("tcn:repost-deleted-open-polls", qoptions);

new Worker("tcn:repost-deleted-open-polls", repostDeletedOpenPolls, qoptions);

loop(async () => queue.add("", null), 300000);
bot.on(Events.MessageDelete, (message) => void (message.channel === channels.voteHere && queue.add("", null)));
