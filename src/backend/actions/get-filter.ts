import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import { proc } from "../trpc.js";

export default proc.input(z.number().int().min(1)).query(
    trpcify("api:get-filter", async (id) => {
        return await db.query.globalFilterTerms.findMany({ columns: { id: true, term: true, regex: true }, where: eq(tables.globalFilterTerms.filter, id) });
    }),
);
