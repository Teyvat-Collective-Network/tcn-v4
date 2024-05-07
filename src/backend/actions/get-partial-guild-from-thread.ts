import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(zs.snowflake)
    .output(z.object({ guild: zs.snowflake, name: z.string(), invite: z.string() }).nullable())
    .query(
        trpcify(async (thread) => {
            return (
                (await db.query.applications.findFirst({
                    columns: { guild: true, name: true, invite: true },
                    where: eq(tables.applications.thread, thread),
                })) ?? null
            );
        }),
    );
