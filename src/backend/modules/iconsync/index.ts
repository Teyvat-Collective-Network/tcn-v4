import { and, eq, not } from "drizzle-orm";
import bot from "../../bot.js";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { loop } from "../../lib/loop.js";

loop(async () => {
    const guilds = await db.query.guilds.findMany({ columns: { id: true, name: true, invite: true } });

    for (const guild of guilds)
        try {
            const data = await bot.fetchInvite(guild.invite);
            const image = data.guild?.iconURL({ extension: "png", forceStatic: true, size: 256 }) ?? `${process.env.DOMAIN}/favicon.png`;

            await db
                .update(tables.guilds)
                .set({ image })
                .where(and(eq(tables.guilds.id, guild.id), not(eq(tables.guilds.image, image))));
        } catch {}
}, 3600000);
