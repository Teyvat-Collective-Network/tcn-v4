import { ButtonInteraction, ChannelType } from "discord.js";
import { eq } from "drizzle-orm";
import bot, { channels } from "../../../bot.js";
import { db } from "../../../db/db.js";
import tables from "../../../db/tables.js";
import { applicationThreadStatusToTag } from "../../../lib/applications.js";
import { ensureObserver, promptConfirm, template } from "../../../lib/bot-lib.js";
import { verifyTypeAndFetchPollID } from "../../../lib/polls.js";

export default async function (interaction: ButtonInteraction, type: string) {
    await interaction.deferReply({ ephemeral: true });
    await ensureObserver(interaction);

    const res = await promptConfirm(
        interaction,
        `Really delete this poll? It will be removed from the database as well and its data and all of its votes will be irreversibly lost. DM reminders will be canceled. ${
            {
                "decline-observation": "The applicant's status will be returned to **pending**.",
                "cancel-observation": "The applicant's status will be returned to **observing**.",
                induction: "The applicant's status will be returned to **observation finished**.",
            }[type] ?? ""
        }`,
    );

    const id = await verifyTypeAndFetchPollID(interaction.message.id, type).catch((error) => {
        res.update(template.error(error));
        throw null;
    });

    await res.update(template.info(`Deleting poll #${id}...`));

    if (["decline-observation", "cancel-observation", "induction"].includes(type)) {
        const data = await db.query.applicationPolls.findFirst({ columns: { thread: true }, where: eq(tables.applicationPolls.ref, id) });

        if (data) {
            const channel = await bot.channels.fetch(data.thread).catch(() => null);

            if (channel?.isThread() && channel.parent?.type === ChannelType.GuildForum && channel.parent === channels.applicants)
                await channel.setAppliedTags([
                    applicationThreadStatusToTag[
                        { "decline-observation": "pending", "cancel-observation": "observing", induction: "observation-finished" }[type]!
                    ],
                ]);
        }
    }

    interaction.message.delete();

    await db.delete(tables.polls).where(eq(tables.polls.id, id));

    await res.editReply(template.ok(`Poll #${id} has been deleted.`));
    channels.logs.send(`Poll #${id} (type: ${type}) was deleted by ${interaction.user}.`);
}
