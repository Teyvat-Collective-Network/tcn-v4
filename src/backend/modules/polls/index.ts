import { ChannelType, Events } from "discord.js";
import { and, eq, inArray, lt } from "drizzle-orm";
import bot, { channels } from "../../bot.js";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { getQuorum, getVoters } from "../../lib/api-lib.js";
import { applicationThreadStatusToTag } from "../../lib/applications.js";
import { electionThreadStatusToTag } from "../../lib/elections.js";
import { loop } from "../../lib/loop.js";
import {
    getCancelObservationResults,
    getDeclineObservationResults,
    getElectionResults,
    getInductionResults,
    renderPoll,
    unrestrictedTypes,
} from "../../lib/polls.js";
import { DMReminderTask, dmReminderQueue, makeWorker, repostDeletedOpenPollsQueue } from "../../queue.js";

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
            channels.logs.send(`<@&${process.env.ROLE_TECH_TEAM}> Error queueing DM reminders for poll #${id}: ${error}`);
            console.error(error);
        }
}, 10000);

makeWorker<DMReminderTask>("tcn:dm-reminders", async ({ id, url, user }) => {
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
});

// Close Polls
loop(async () => {
    const polls = await db.query.polls.findMany({
        columns: { id: true, message: true, type: true },
        where: and(lt(tables.polls.deadline, Date.now()), eq(tables.polls.trulyClosed, false), eq(tables.polls.errored, false)),
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
            if (!msg) throw "Could not find poll message.";

            await msg.edit(await renderPoll(id));
            await db.update(tables.polls).set({ trulyClosed: true }).where(eq(tables.polls.id, id));

            await db
                .insert(tables.expectedVoters)
                .values((await getVoters(unrestrictedTypes.includes(type))).map((user) => ({ poll: id, user })))
                .onDuplicateKeyUpdate({ set: { poll: id } });

            const link = `[poll #${id}](<${msg.url}>)`;
            channels.logs.send(`Closed ${link}.`);

            if (["decline-observation", "cancel-observation", "induction"].includes(type))
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
                    else if (type === "cancel-observation")
                        if (valid) {
                            const { verdict } = await getCancelObservationResults(id);

                            await channel.setAppliedTags([
                                verdict === "cancel" ? applicationThreadStatusToTag.rejected : applicationThreadStatusToTag.observing,
                            ]);

                            await channel.send(
                                {
                                    cancel: `The council voted to cancel this applicant's observation and reject them immediately: ${msg.url}`,
                                    continue: `The council voted to continue observing this applicant: ${msg.url}`,
                                    tie: `The council voted on canceling this applicant's observation but reached a tie: ${msg.url}`,
                                }[verdict],
                            );
                        } else {
                            await channel.setAppliedTags([applicationThreadStatusToTag.observing]);
                            await channel.send(`The council did not reach quorum on whether to cancel this applicant's observation: ${msg.url}`);
                        }
                    else if (type === "induction")
                        if (valid) {
                            const poll = await db.query.inductionPolls.findFirst({ columns: { mode: true }, where: eq(tables.inductionPolls.ref, id) });
                            if (!poll) throw `Could not fetch induction poll data for poll #${id}.`;

                            const { verdict } = await getInductionResults(id, poll.mode);

                            await channel.setAppliedTags([
                                verdict === "induct"
                                    ? applicationThreadStatusToTag.inducted
                                    : verdict === "preapprove"
                                    ? applicationThreadStatusToTag["pre-approved"]
                                    : verdict === "reject"
                                    ? applicationThreadStatusToTag.rejected
                                    : verdict === "extend"
                                    ? applicationThreadStatusToTag.pending
                                    : applicationThreadStatusToTag["observation-finished"],
                            ]);

                            await channel.send(
                                {
                                    induct: `The council voted to induct this applicant: ${msg.url} (observers: use [this link](<${process.env.DOMAIN}/admin/servers/new?origin=${channel.id}>) to add the server)`,
                                    preapprove: `The council voted to pre-approve this applicant: ${msg.url}`,
                                    reject: `The council voted to reject this applicant: ${msg.url}`,
                                    extend: `The council voted to extend this applicant's observation: ${msg.url}`,
                                    tie: `The council's vote tied between the positive and negative options: ${msg.url}`,
                                    "positive-tie": `The council's vote tied between inducting and pre-approving: ${msg.url}`,
                                    "negative-tie": `The council's vote tied between rejecting and extending observation: ${msg.url}`,
                                }[verdict],
                            );
                        } else {
                            await channel.setAppliedTags([applicationThreadStatusToTag["observation-finished"]]);
                            await channel.send(`The council did not reach quorum on this applicant's induction: ${msg.url}`);
                        }
                } catch (error) {
                    channels.logs.send(
                        `<@&${process.env.ROLE_TECH_TEAM}> Error resolving application status for ${link}. Please fix this manually. Error: ${error}`,
                    );
                    console.error(error);
                }
            else if (type === "election")
                try {
                    const [data] = await db
                        .select({ thread: tables.electionPolls.thread, wave: tables.elections.wave })
                        .from(tables.electionPolls)
                        .innerJoin(tables.elections, eq(tables.electionPolls.thread, tables.elections.channel))
                        .where(eq(tables.electionPolls.ref, id));

                    if (!data) throw "Could not fetch election poll data.";

                    const channel = await bot.channels.fetch(data.thread);
                    if (!channel?.isThread() || channel.parent?.type !== ChannelType.GuildForum || channel.parent !== channels.elections)
                        throw "Found invalid applicant thread.";

                    const valid = await getQuorum(id, type);

                    if (valid) {
                        await channel.setAppliedTags([electionThreadStatusToTag.done]);
                        const { winners, ties, runnerups } = await getElectionResults(id);

                        for (const [list, status] of [
                            [winners, "elected"],
                            [ties, "tied"],
                            [runnerups, "runner-up"],
                        ] as const)
                            if (list.length > 0)
                                await db
                                    .update(tables.electionHistory)
                                    .set({ status })
                                    .where(and(eq(tables.electionHistory.wave, data.wave), inArray(tables.electionHistory.user, list)));
                    }
                } catch (error) {
                    channels.logs.send(
                        `<@&${process.env.ROLE_TECH_TEAM}> Error resolving election status for ${link}. Please fix this manually. Error: ${error}`,
                    );
                    console.error(error);
                }
        } catch (error) {
            channels.logs.send(`<@&${process.env.ROLE_TECH_TEAM}> Error closing poll #${id} (marking as errored and abandoning): ${error}`);
            console.error(error);

            await db.update(tables.polls).set({ errored: true }).where(eq(tables.polls.id, id));
        }
}, 10000);

async function repostDeletedOpenPolls() {
    const polls = await db.query.polls.findMany({ where: eq(tables.polls.trulyClosed, false) });

    for (const { message, ...poll } of polls) {
        if (!!(await channels.voteHere.messages.fetch(message).catch(() => null))) continue;

        try {
            const newMessage = await channels.voteHere.send(await renderPoll(poll.id));
            await db.update(tables.polls).set({ message: newMessage.id }).where(eq(tables.polls.id, poll.id));
            await db.update(tables.auditEntryTargets).set({ target: newMessage.id }).where(eq(tables.auditEntryTargets.target, message));

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

makeWorker("tcn:repost-deleted-open-polls", repostDeletedOpenPolls);

loop(async () => repostDeletedOpenPollsQueue.add("", null), 300000);
bot.on(Events.MessageDelete, (message) => void (message.channel === channels.voteHere && repostDeletedOpenPollsQueue.add("", null)));
