import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc.input(z.object({ actor: zs.snowflake, id: z.number().int().min(1), regex: z.boolean() })).mutation(
    trpcify(async ({ actor, id, regex }) => {
        const entry = await db.query.globalFilterTerms.findFirst({ where: eq(tables.globalFilterTerms.id, id) });
        if (!entry) return "This filter term no longer exists.";

        await db.update(tables.globalFilterTerms).set({ regex }).where(eq(tables.globalFilterTerms.id, id));
        await audit(actor, "global/filter/edit-term-regex", null, { term: entry.term, regex });

        return null;
    }),
);
