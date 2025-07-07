import { count, desc, sql } from "drizzle-orm";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import { proc } from "../trpc.js";

export default proc.query(
    trpcify("api:get-metrics", async () => {
        const sq = db.select().from(tables.speedMetrics).orderBy(desc(tables.speedMetrics.time)).limit(10000).as("sq");

        return await db
            .select({
                key: sq.key,
                averageDuration: sql<number>`avg(duration)`,
                count: count(),
                errorRate: sql<number>`avg(errored)`,
            })
            .from(sq)
            .groupBy(tables.speedMetrics.key);
    }),
);
