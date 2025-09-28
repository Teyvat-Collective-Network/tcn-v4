import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(zs.snowflake)
    .output(
        z
            .object({
                author: zs.snowflake,
                reason: z.string(),
                evidence: z.string(),
                server: zs.snowflake,
                category: z.string(),
                created: z.number().int(),
            })
            .array(),
    )
    .query(
        trpcify("api:get-past-reports", async (user) => {
            const entries = await db.query.reportIds.findMany({ where: eq(tables.reportIds.user, user) });

            return await db
                .select({
                    author: tables.networkUserReports.author,
                    reason: tables.networkUserReports.reason,
                    evidence: tables.networkUserReports.evidence,
                    server: tables.networkUserReports.server,
                    category: tables.networkUserReports.category,
                    created: tables.networkUserReports.created,
                })
                .from(tables.networkUserReports)
                .where(
                    inArray(
                        tables.networkUserReports.id,
                        entries.map((entry) => entry.ref),
                    ),
                );
        }),
    );
