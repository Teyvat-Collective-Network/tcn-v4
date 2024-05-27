import { and, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import { guilds } from "../db/schemas.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { fixUserRolesQueue } from "../queue.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ actor: zs.snowflake, guild: zs.snowflake, delegated: z.boolean() }))
    .output(z.string().nullable())
    .mutation(
        trpcify("api:set-delegated", async ({ actor, guild, delegated }) => {
            const eqCheck = eq(tables.guilds.id, guild);

            const obj = await db.query.guilds.findFirst({ columns: { delegated: true, owner: true, advisor: true }, where: eqCheck });

            if (!obj) return "Guild not found.";
            if (obj.delegated && delegated) return "This guild's vote is already delegated.";
            if (!obj.delegated && !delegated) return "This guild's vote is not currently ydelegated.";
            if (delegated && !obj.advisor) return "This guild does not have an advisor.";

            await db
                .update(guilds)
                .set({ delegated })
                .where(delegated ? and(eqCheck, isNotNull(tables.guilds.advisor)) : eqCheck);

            await audit(actor, "guilds/update/delegated", guild, delegated);

            await fixUserRolesQueue.add("", obj.owner);
            if (obj.advisor) await fixUserRolesQueue.add("", obj.advisor);

            return null;
        }),
    );
