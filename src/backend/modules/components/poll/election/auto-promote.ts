import { ButtonInteraction } from "discord.js";
import { and, eq } from "drizzle-orm";
import { db } from "../../../../db/db.js";
import tables from "../../../../db/tables.js";
import { englishList } from "../../../../lib.js";
import { audit } from "../../../../lib/audit.js";
import { ensureObserver, promptConfirm, template } from "../../../../lib/bot-lib.js";
import { getElectionResults, renderPoll, verifyTypeAndFetchPollID } from "../../../../lib/polls.js";
import { fixUserRolesQueue } from "../../../../queue.js";

export default async function (interaction: ButtonInteraction) {
    await interaction.deferReply({ ephemeral: true });
    await ensureObserver(interaction);

    const id = await verifyTypeAndFetchPollID(interaction.message.id, "election");

    const { winners } = await getElectionResults(id);

    const res = await promptConfirm(interaction, `Promote / refresh terms for ${englishList(winners.map((id) => `<@${id}>`))}?`);

    const [{ affectedRows }] = await db
        .update(tables.electionPolls)
        .set({ autopromoted: true })
        .where(and(eq(tables.electionPolls.ref, id), eq(tables.electionPolls.autopromoted, false)));

    if (affectedRows === 0) return void res.update(template.error("This action was already triggered by another observer."));

    await res.update(template.info("Promoting observers..."));

    const alreadyObservers = await db.query.users.findMany({ columns: { id: true }, where: eq(tables.users.observer, true) });
    const ids = new Set(alreadyObservers.map((user) => user.id));

    await db
        .insert(tables.users)
        .values(winners.map((id) => ({ id, observer: true, observerSince: Date.now() })))
        .onDuplicateKeyUpdate({ set: { observer: true, observerSince: Date.now() } });

    await fixUserRolesQueue.addBulk(winners.map((id) => ({ name: "", data: id })));

    for (const id of winners) await audit(interaction.user.id, ids.has(id) ? "users/refresh-term" : "users/promote", null, id, [id]);

    await res.editReply(template.ok("Promoted observers."));

    await interaction.message.edit(await renderPoll(id));
}
