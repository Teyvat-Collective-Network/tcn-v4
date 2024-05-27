import { count, sql } from "drizzle-orm";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import { proc } from "../trpc.js";

export default proc.query(
    trpcify("api:get-metrics", async () => {
        return await db
            .select({
                key: tables.speedMetrics.key,
                averageDuration: sql<number>`avg(duration)`,
                count: count(),
                errorRate: sql<number>`avg(errored)`,
            })
            .from(tables.speedMetrics)
            .groupBy(tables.speedMetrics.key);
    }),
);
