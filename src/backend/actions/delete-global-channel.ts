import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import trpcify from "../lib/trpcify.js";
import { proc } from "../trpc.js";

export default proc.input(z.object({ actor: z.string(), id: z.number().int().min(1), password: z.string().nullable() })).mutation(
    trpcify(async ({ actor, id, password }) => {
        const entry = await db.query.globalChannels.findFirst({
            columns: { name: true, visible: true, password: true, protected: true },
            where: eq(tables.globalChannels.id, id),
        });

        if (!entry) return "That channel does not exist.";
        if (entry.password !== null && entry.password !== password) return "Incorrect password.";
        if (entry.protected) return "That channel is protected.";

        await db.delete(tables.globalChannels).where(and(eq(tables.globalChannels.id, id), eq(tables.globalChannels.protected, false)));
        await audit(actor, "global/channels/delete", null, { id, name: entry.name });
    }),
);
