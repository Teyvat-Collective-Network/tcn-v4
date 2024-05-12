import { ButtonInteraction } from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "../../../../db/db.js";
import tables from "../../../../db/tables.js";
import { ensureObserver } from "../../../../lib/bot-lib.js";
import { renderPoll, verifyTypeAndFetchPollID } from "../../../../lib/polls.js";

export default async function (interaction: ButtonInteraction) {
    await ensureObserver(interaction);
    await interaction.deferUpdate();

    const id = await verifyTypeAndFetchPollID(interaction.message.id, "election");

    await db.update(tables.electionPolls).set({ autopromoted: true }).where(eq(tables.electionPolls.ref, id));

    await interaction.editReply(await renderPoll(id));
}
