import { db } from "../db/db.js";
import tables from "../db/tables.js";

export async function audit(actor: string, type: string, guild: string | null, data: any, targets: string[] = []) {
    const [{ insertId }] = await db.insert(tables.auditLogs).values({ time: Date.now(), actor, type, guild, data });
    if (targets.length > 0) await db.insert(tables.auditEntryTargets).values(targets.map((target) => ({ target, ref: insertId })));
}
