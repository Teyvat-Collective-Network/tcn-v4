import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(zs.snowflake)
    .output(z.boolean())
    .query(
        trpcify("api:has-passed-report-quiz", async (id) => {
            const entry = await db.query.users.findFirst({ columns: { reportsQuizPassed: true }, where: eq(tables.users.id, id) });
            return entry?.reportsQuizPassed ?? false;
        }),
    );
