import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ actor: zs.snowflake, id: z.number().int().min(1), newPassword: z.string().max(128).nullable(), password: z.string().nullable() }))
    .mutation(
        trpcify("api:edit-global-channel-password", async ({ actor, id, newPassword, password }) => {
            const entry = await db.query.globalChannels.findFirst({
                columns: { name: true, visible: true, password: true },
                where: eq(tables.globalChannels.id, id),
            });

            if (!entry) return "That channel does not exist.";
            if (entry.password !== null && entry.password !== password) return "Incorrect password.";

            await db.update(tables.globalChannels).set({ password: newPassword }).where(eq(tables.globalChannels.id, id));
            await audit(actor, "global/channels/set-password", null, { id, name: entry.name });

            return null;
        }),
    );
