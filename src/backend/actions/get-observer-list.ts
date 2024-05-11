import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc.output(z.object({ id: zs.snowflake, observerSince: z.number().int().min(0) }).array()).query(
    trpcify(async () => {
        return await db.query.users.findMany({ columns: { id: true, observerSince: true }, where: eq(tables.users.observer, true) });
    }),
);
