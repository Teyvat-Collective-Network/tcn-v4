import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ actor: zs.snowflake, channel: z.number().int().min(1), priority: z.enum(["high", "normal", "low"]) }))
    .output(z.string().nullable())
    .mutation(
        trpcify("api:set-priority", async ({ actor, channel, priority }) => {
            const obj = await db.query.globalChannels.findFirst({ columns: { name: true }, where: eq(tables.globalChannels.id, channel) });
            if (!obj) return "Channel not found.";

            await db.update(tables.globalChannels).set({ priority }).where(eq(tables.globalChannels.id, channel));

            await audit(actor, "global/set-priority", null, { id: channel, name: obj.name, priority });

            return null;
        }),
    );
