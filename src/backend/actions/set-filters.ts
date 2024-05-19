import { and, eq, inArray, notInArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ actor: zs.snowflake, channel: z.number().int().min(1), filters: z.number().int().min(1).array(), password: z.string().nullable() }))
    .output(z.string().nullable())
    .mutation(
        trpcify(async ({ actor, channel, filters, password }) => {
            const obj = await db.query.globalChannels.findFirst({ columns: { name: true, password: true }, where: eq(tables.globalChannels.id, channel) });
            if (!obj) return "Channel not found.";
            if (obj.password !== null && obj.password !== password) return "Incorrect password.";

            const objects = filters.length === 0 ? [] : await db.query.globalFilters.findMany({ where: inArray(tables.globalFilters.id, filters) });
            if (objects.length < filters.length) return "At least one of those filters no longer exists.";

            if (filters.length === 0) await db.delete(tables.globalAppliedFilters).where(eq(tables.globalAppliedFilters.channel, channel));
            else {
                await db
                    .delete(tables.globalAppliedFilters)
                    .where(and(eq(tables.globalAppliedFilters.channel, channel), notInArray(tables.globalAppliedFilters.filter, filters)));

                await db
                    .insert(tables.globalAppliedFilters)
                    .values(filters.map((filter) => ({ channel, filter })))
                    .onDuplicateKeyUpdate({ set: { channel } });
            }

            await audit(actor, "global/set-filters", null, { id: channel, name: obj.name, filters: objects });

            return null;
        }),
    );
