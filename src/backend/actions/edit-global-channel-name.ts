import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc.input(z.object({ actor: zs.snowflake, id: z.number().int().min(1), name: z.string().max(80), password: z.string().nullable() })).mutation(
    trpcify(async ({ actor, id, name, password }) => {
        const entry = await db.query.globalChannels.findFirst({ columns: { name: true, password: true }, where: eq(tables.globalChannels.id, id) });
        if (!entry) return "That channel does not exist.";
        if (entry.password !== null && entry.password !== password) return "Incorrect password.";
        if (entry.name === name) return "The new name is the same as the old name.";

        await db.update(tables.globalChannels).set({ name }).where(eq(tables.globalChannels.id, id));
        await audit(actor, "global/channels/set-name", null, { id, oldName: entry.name, name });

        return null;
    }),
);
