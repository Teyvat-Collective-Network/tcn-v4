import { Events } from "discord.js";
import { eq, or } from "drizzle-orm";
import bot, { channels } from "../../bot.js";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { renderHQBanshare, updateBanshareDashboard } from "../../lib/banshares.js";
import { loop } from "../../lib/loop.js";

loop(async () => {
    const banshares = await db.query.banshares.findMany({
        columns: { id: true, message: true },
        where: or(eq(tables.banshares.status, "pending"), eq(tables.banshares.status, "locked")),
    });

    let updated = false;

    for (const banshare of banshares)
        try {
            const message = await channels.banshareLogs.messages.fetch(banshare.message).catch(() => null);
            if (message) continue;

            const { id } = await channels.banshareLogs.send(await renderHQBanshare(banshare.id));

            await db.update(tables.banshares).set({ message: id }).where(eq(tables.banshares.id, banshare.id));

            updated = true;
        } catch {}

    if (updated) await updateBanshareDashboard();
}, 60000);

bot.on(Events.MessageDelete, async (message) => {
    if (message.channel !== channels.banshareLogs) return;
    const banshare = await db.query.banshares.findFirst({ columns: { id: true, status: true }, where: eq(tables.banshares.message, message.id) });
    if (!banshare || (banshare.status !== "pending" && banshare.status !== "locked")) return;

    const { id } = await channels.banshareLogs.send(await renderHQBanshare(banshare.id));
    await db.update(tables.banshares).set({ message: id }).where(eq(tables.banshares.id, banshare.id));

    await updateBanshareDashboard();
});
