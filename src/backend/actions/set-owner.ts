import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { fixUserRolesQueue } from "../queue.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ guild: zs.snowflake, owner: z.string() }))
    .output(z.string().nullable())
    .mutation(
        trpcify(async ({ guild, owner }) => {
            if (!owner.match(/^[1-9][0-9]{16,19}$/)) return "Invalid user ID.";

            const obj = await db.query.guilds.findFirst({ columns: { owner: true }, where: eq(tables.guilds.id, guild) });

            if (!obj) return "Guild not found.";
            if (obj.owner === owner) return "That user is already the owner.";

            await db.update(tables.guilds).set({ owner }).where(eq(tables.guilds.id, guild));

            await fixUserRolesQueue.add("", obj.owner);
            await fixUserRolesQueue.add("", owner);

            return null;
        }),
    );
