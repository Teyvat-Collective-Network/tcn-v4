import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc.input(z.object({ actor: zs.snowflake, id: z.number().int().min(1), name: z.string() })).mutation(
    trpcify(async ({ actor, id, name }) => {
        const entry = await db.query.globalFilters.findFirst({ where: eq(tables.globalFilters.id, id) });
        if (!entry) return "This filter no longer exists.";

        await db.update(tables.globalFilters).set({ name }).where(eq(tables.globalFilters.id, id));
        await audit(actor, "global/filter/rename", null, { before: entry.name, name });

        return null;
    }),
);
