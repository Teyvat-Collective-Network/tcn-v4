import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { fixUserRolesQueue } from "../queue.js";
import { proc } from "../trpc.js";

export default proc
    .input(zs.snowflake)
    .output(z.string().nullable())
    .mutation(
        trpcify(async (id) => {
            const guild = await db.query.guilds.findFirst({ where: eq(tables.guilds.id, id) });

            if (!guild) return "Guild not found.";
            if (!guild.advisor) return "This guild does not have an advisor.";

            await db.update(tables.guilds).set({ owner: guild.advisor, advisor: guild.owner }).where(eq(tables.guilds.id, id));

            await fixUserRolesQueue.add("", guild.owner);
            await fixUserRolesQueue.add("", guild.advisor);

            return null;
        }),
    );
