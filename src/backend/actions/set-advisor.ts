import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { fixUserRolesQueue } from "../queue.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ guild: zs.snowflake, advisor: z.string() }))
    .output(z.string().nullable())
    .mutation(
        trpcify(async ({ guild, advisor }) => {
            if (!advisor.match(/^([1-9][0-9]{16,19})?$/)) return "Invalid user ID.";

            const obj = await db.query.guilds.findFirst({ columns: { advisor: true }, where: eq(tables.guilds.id, guild) });

            if (!obj) return "Guild not found.";
            if (obj.advisor === advisor) return "That user is already the advisor.";

            await db
                .update(tables.guilds)
                .set({ advisor: advisor || null, delegated: advisor ? undefined : false })
                .where(eq(tables.guilds.id, guild));

            if (obj.advisor) await fixUserRolesQueue.add("", obj.advisor);
            await fixUserRolesQueue.add("", advisor);

            return null;
        }),
    );
