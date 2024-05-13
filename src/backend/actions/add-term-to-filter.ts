import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc.input(z.object({ actor: zs.snowflake, id: z.number().int().min(1), term: z.string(), regex: z.boolean() })).mutation(
    trpcify(async ({ actor, id, term, regex }) => {
        await db.insert(tables.globalFilterTerms).values({ filter: id, term, regex });
        await audit(actor, "global/filter/add-term", null, { term, regex });

        return null;
    }),
);
