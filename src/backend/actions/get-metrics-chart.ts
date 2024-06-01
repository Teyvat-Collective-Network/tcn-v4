import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.string())
    .output(z.object({ duration: z.number(), errored: z.boolean() }).array())
    .query(
        trpcify("api:get-metrics-chart", async (key) => {
            const data = await db.query.speedMetrics.findMany({
                columns: { duration: true, errored: true },
                orderBy: desc(tables.speedMetrics.time),
                limit: 100,
                where: eq(tables.speedMetrics.key, key),
            });

            return data.reverse();
        }),
    );
