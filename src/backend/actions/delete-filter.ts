import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc.input(z.object({ actor: zs.snowflake, id: z.number().int().min(1) })).mutation(
    trpcify("api:delete-filter", async ({ actor, id }) => {
        const entry = await db.query.globalFilters.findFirst({ where: eq(tables.globalFilters.id, id) });
        if (!entry) return "This filter no longer exists.";

        const terms = await db.query.globalFilterTerms.findMany({
            columns: { term: true, regex: true },
            where: eq(tables.globalFilterTerms.filter, id),
        });

        await db.delete(tables.globalFilters).where(eq(tables.globalFilters.id, id));
        await audit(actor, "global/filter/delete", null, { name: entry.name, terms });

        return null;
    }),
);
