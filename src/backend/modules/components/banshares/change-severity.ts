import { ButtonInteraction } from "discord.js";
import { and, eq, or } from "drizzle-orm";
import { channels } from "../../../bot.js";
import { db } from "../../../db/db.js";
import tables from "../../../db/tables.js";
import { renderHQBanshare, severities } from "../../../lib/banshares.js";
import { ensureObserver } from "../../../lib/bot-lib.js";

export default async function (interaction: ButtonInteraction, severity: string) {
    await ensureObserver(interaction);

    if (!severities[severity]) throw "Invalid severity.";

    const banshare = await db.query.banshares.findFirst({ columns: { id: true }, where: eq(tables.banshares.message, interaction.message.id) });
    if (!banshare) throw "Could not fetch this banshare.";

    await interaction.deferUpdate();

    const [{ affectedRows }] = await db
        .update(tables.banshares)
        .set({ severity })
        .where(and(eq(tables.banshares.id, banshare.id), or(eq(tables.banshares.status, "pending"), eq(tables.banshares.status, "locked"))));

    if (affectedRows === 0) throw "This banshare is not pending/locked; your action may have coincided with a slightly earlier one.";

    await interaction.editReply(await renderHQBanshare(banshare.id));

    await channels.logs.send(`${interaction.message.url} was moved to the ${severities[severity]} severity by ${interaction.user}.`);
}
