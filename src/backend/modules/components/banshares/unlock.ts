import { ButtonInteraction } from "discord.js";
import { and, eq } from "drizzle-orm";
import { channels } from "../../../bot.js";
import { db } from "../../../db/db.js";
import tables from "../../../db/tables.js";
import { renderBanshareControls } from "../../../lib/banshares.js";
import { ensureObserver } from "../../../lib/bot-lib.js";

export default async function (interaction: ButtonInteraction) {
    await ensureObserver(interaction);

    await interaction.deferUpdate();

    const banshare = await db.query.banshares.findFirst({ columns: { id: true }, where: eq(tables.banshares.message, interaction.message.id) });
    if (!banshare) throw "Could not fetch this banshare.";

    const [{ affectedRows }] = await db
        .update(tables.banshares)
        .set({ status: "pending" })
        .where(and(eq(tables.banshares.id, banshare.id), eq(tables.banshares.status, "locked")));

    if (affectedRows === 0) throw "This banshare is not locked; your action may have coincided with a slightly earlier one.";

    await interaction.editReply({ components: await renderBanshareControls(banshare.id) });

    await channels.logs.send(`${interaction.message.url} was unlocked by ${interaction.user}.`);
}
