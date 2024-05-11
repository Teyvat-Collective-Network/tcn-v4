import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { fixUserRolesQueue } from "../queue.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ actor: zs.snowflake, guild: zs.snowflake }))
    .output(z.string().nullable())
    .mutation(
        trpcify(async ({ actor, guild }) => {
            const obj = await db.query.guilds.findFirst({ where: eq(tables.guilds.id, guild) });

            if (!obj) return "Guild not found.";
            if (!obj.advisor) return "This guild does not have an advisor.";

            await db.update(tables.guilds).set({ owner: obj.advisor, advisor: obj.owner }).where(eq(tables.guilds.id, guild));
            await audit(actor, "guilds/update/swap-representatives", guild, [obj.owner, obj.advisor]);

            await fixUserRolesQueue.add("", obj.owner);
            await fixUserRolesQueue.add("", obj.advisor);

            return null;
        }),
    );
