import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc.input(z.object({ actor: zs.snowflake, id: z.number().int().min(1), visible: z.boolean(), password: z.string().nullable() })).mutation(
    trpcify("api:edit-global-channel-visibility", async ({ actor, id, visible, password }) => {
        const entry = await db.query.globalChannels.findFirst({
            columns: { name: true, visible: true, password: true },
            where: eq(tables.globalChannels.id, id),
        });

        if (!entry) return "That channel does not exist.";
        if (entry.password !== null && entry.password !== password) return "Incorrect password.";
        if (entry.visible === visible) return `That channel is already ${visible ? "visible" : "hidden"}.`;

        await db.update(tables.globalChannels).set({ visible }).where(eq(tables.globalChannels.id, id));
        await audit(actor, "global/channels/set-visible", null, { id, name: entry.name, visible });

        return null;
    }),
);
