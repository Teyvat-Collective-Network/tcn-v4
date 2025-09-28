import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(zs.snowflake)
    .output(zs.snowflake.array().nullable())
    .query(
        trpcify("api:check-staff", async (user) => {
            try {
                const entries = await db.query.guildStaff.findMany({ where: eq(tables.guildStaff.user, user) });
                return entries.map((entry) => entry.guild);
            } catch {
                return null;
            }
        }),
    );
