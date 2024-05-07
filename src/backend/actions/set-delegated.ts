import { and, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import { guilds } from "../db/schemas.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { fixUserRolesQueue } from "../queue.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ guild: zs.snowflake, delegated: z.boolean() }))
    .output(z.string().nullable())
    .mutation(
        trpcify(async ({ guild, delegated }) => {
            const eqCheck = eq(tables.guilds.id, guild);

            const obj = await db.query.guilds.findFirst({ where: eqCheck });

            if (!obj) return "Guild not found.";
            if (delegated && !obj.advisor) return "This guild does not have an advisor.";

            await db
                .update(guilds)
                .set({ delegated })
                .where(delegated ? and(eqCheck, isNotNull(tables.guilds.advisor)) : eqCheck);

            await fixUserRolesQueue.add("", obj.owner);
            if (obj.advisor) await fixUserRolesQueue.add("", obj.advisor);

            return null;
        }),
    );
