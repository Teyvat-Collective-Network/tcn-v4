import { ButtonInteraction } from "discord.js";
import { eq } from "drizzle-orm";
import { channels } from "../../../bot.js";
import { db } from "../../../db/db.js";
import tables from "../../../db/tables.js";
import { ensureObserver, promptConfirm, template } from "../../../lib/bot-lib.js";
import { renderPoll, verifyTypeAndFetchPollID } from "../../../lib/polls.js";

export default async function (interaction: ButtonInteraction, type: string) {
    await interaction.deferReply({ ephemeral: true });
    await ensureObserver(interaction);

    const res = await promptConfirm(
        interaction,
        "Really reset the deadline for this poll? The deadline will be moved to two days from now and a DM reminder will be set for one day from now.",
    );

    const id = await verifyTypeAndFetchPollID(interaction.message.id, type).catch((error) => {
        res.update(template.error(error));
        throw null;
    });

    await res.update(template.info(`Resetting deadline for poll #${id}...`));

    await db
        .update(tables.polls)
        .set({ reminder: Date.now() + 86400000, deadline: Date.now() + 172800000, closed: false, trulyClosed: false })
        .where(eq(tables.polls.id, id));

    try {
        await interaction.message.edit(await renderPoll(id));
    } catch {}

    await res.editReply(template.ok(`The deadline for poll #${id} has been reset.`));
    channels.logs.send(`Poll #${id} (type: ${type}) deadline was reset by ${interaction.user}.`);
}
