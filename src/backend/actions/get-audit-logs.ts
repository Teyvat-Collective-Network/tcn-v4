import { and, count, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(
        z.object({
            actor: z.string().nullable(),
            types: z.string().array().nullable(),
            guild: zs.snowflake.nullable(),
            target: zs.snowflake.nullable(),
            offset: z.number().int().min(0),
            limit: z.number().int().min(1).max(100),
        }),
    )
    .output(
        z.object({
            pages: z.number().int().min(1),
            entries: z.object({ time: z.number().int().min(0), actor: z.string(), type: z.string(), guild: z.string().nullable(), data: z.any() }).array(),
        }),
    )
    .query(
        trpcify("api:get-audit-logs", async ({ actor, types, guild, target, offset, limit }) => {
            const conditions = [
                actor ? eq(tables.auditLogs.actor, actor) : [],
                types ? inArray(tables.auditLogs.type, types) : [],
                guild ? eq(tables.auditLogs.guild, guild) : [],
                target ? eq(tables.auditEntryTargets.target, target) : [],
            ].flat();

            const clause = conditions.length === 0 ? null : conditions.length === 1 ? conditions[0] : and(...conditions);

            const base = db
                .select({
                    time: tables.auditLogs.time,
                    actor: tables.auditLogs.actor,
                    type: tables.auditLogs.type,
                    guild: tables.auditLogs.guild,
                    data: tables.auditLogs.data,
                })
                .from(tables.auditLogs);

            const query = target ? base.innerJoin(tables.auditEntryTargets, eq(tables.auditEntryTargets.ref, tables.auditLogs.id)) : base;

            const entries = clause
                ? await query.where(clause).orderBy(desc(tables.auditLogs.id)).offset(offset).limit(limit)
                : await query.orderBy(desc(tables.auditLogs.id)).offset(offset).limit(limit);

            const countBase = db.select({ count: count() }).from(tables.auditLogs);
            const countQuery = target ? countBase.innerJoin(tables.auditEntryTargets, eq(tables.auditEntryTargets.ref, tables.auditLogs.id)) : countBase;
            const countEntries = clause ? await countQuery.where(clause) : await countQuery;

            return { pages: Math.max(Math.ceil(countEntries[0].count / limit), 1), entries };
        }),
    );
