import { ButtonInteraction } from "discord.js";
import { and, eq } from "drizzle-orm";
import { channels } from "../../../bot.js";
import { db } from "../../../db/db.js";
import tables from "../../../db/tables.js";
import { audit } from "../../../lib/audit.js";
import { renderBanshareControls, updateBanshareDashboard } from "../../../lib/banshares.js";
import { ensureObserver } from "../../../lib/bot-lib.js";

export default async function (interaction: ButtonInteraction) {
    await ensureObserver(interaction);

    const banshare = await db.query.banshares.findFirst({ columns: { id: true }, where: eq(tables.banshares.message, interaction.message.id) });
    if (!banshare) throw "Could not fetch this banshare.";

    await interaction.deferUpdate();

    const [{ affectedRows }] = await db
        .update(tables.banshares)
        .set({ status: "rejected" })
        .where(and(eq(tables.banshares.id, banshare.id), eq(tables.banshares.status, "pending")));

    if (affectedRows === 0) throw "This banshare is no longer pending.";

    await interaction.editReply({ components: await renderBanshareControls(banshare.id) });

    await channels.logs.send(`${interaction.message.url} was rejected by ${interaction.user}.`);
    await audit(interaction.user.id, "banshares/reject", null, banshare.id, [interaction.message.id]);

    updateBanshareDashboard();
}
