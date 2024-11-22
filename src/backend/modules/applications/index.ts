import { Events } from "discord.js";
import { eq } from "drizzle-orm";
import bot, { channels } from "../../bot.js";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { createApplicationThread } from "../../lib/applications.js";
import { loop } from "../../lib/loop.js";
import { reloadApplicationPolls } from "../../lib/polls.js";
import { makeWorker, repostDeletedApplicationThreadsQueue } from "../../queue.js";

async function repostDeletedApplicationThreads() {
    return; // this feature is broken, but I am keeping the code around for reference
    const applications = await db.query.applications.findMany();

    for (const { thread, ...application } of applications) {
        if (!!(await bot.channels.fetch(thread).catch(() => null))) continue;

        try {
            const invite = await bot.fetchInvite(application.invite);
            if (!invite.guild) throw "Invalid invite: does not point to guild.";

            const newChannel = await createApplicationThread(
                application.user,
                invite,
                invite.guild,
                application.experience,
                application.goals,
                application.history,
                application.additional,
                application.name,
            );

            await db
                .update(tables.applications)
                .set({ thread: newChannel.id, url: `${newChannel.url}/${newChannel.id}` })
                .where(eq(tables.applications.thread, thread));

            reloadApplicationPolls(newChannel.id);

            await newChannel.send({
                content: `<@&${process.env.ROLE_TECH_TEAM}> This channel is a recreation of the previous application thread which was deleted. If this thread should be deleted, please nuke it using \`/application nuke\`. The status is pending because it cannot be recovered. Please fix this if needed.`,
                allowedMentions: { roles: [process.env.ROLE_TECH_TEAM!] },
            });
        } catch (error) {
            channels.logs.send({
                content: `<@&${process.env.ROLE_TECH_TEAM}> Error recreating deleted application thread. Details provided below. Error: ${error}`,
                files: [{ name: "dump.json", attachment: Buffer.from(JSON.stringify(application)) }],
                allowedMentions: { roles: [process.env.ROLE_TECH_TEAM!] },
            });

            console.error(error);
        }
    }
}

makeWorker("repost-deleted-application-threads", repostDeletedApplicationThreads);

loop("full-trigger-repost-deleted-application-threads", async () => repostDeletedApplicationThreadsQueue.add("", null), 300000);
bot.on(Events.ThreadDelete, (thread) => void (thread.parent === channels.applicants && repostDeletedApplicationThreadsQueue.add("", null)));
