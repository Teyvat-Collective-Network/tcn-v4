import { ButtonInteraction } from "discord.js";
import { and, eq } from "drizzle-orm";
import { channels } from "../../../bot.js";
import { db } from "../../../db/db.js";
import tables from "../../../db/tables.js";
import { audit } from "../../../lib/audit.js";
import { renderBanshareControls } from "../../../lib/banshares.js";

export default async function (interaction: ButtonInteraction) {
    const banshare = await db.query.banshares.findFirst({ columns: { id: true }, where: eq(tables.banshares.message, interaction.message.id) });
    if (!banshare) throw "Could not fetch this banshare.";

    await interaction.deferUpdate();

    const [{ affectedRows }] = await db
        .update(tables.banshares)
        .set({ status: "locked" })
        .where(and(eq(tables.banshares.id, banshare.id), eq(tables.banshares.status, "pending")));

    if (affectedRows === 0) throw "This banshare is not pending; your action may have coincided with a slightly earlier one.";

    await interaction.editReply({ components: await renderBanshareControls(banshare.id) });

    await channels.observerManagement.send(`${interaction.message.url} was locked by ${interaction.user}.`);
    await audit(interaction.user.id, "banshares/lock", null, banshare.id, [interaction.message.id]);
}
