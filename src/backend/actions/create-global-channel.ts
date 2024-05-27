import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc.input(z.object({ actor: zs.snowflake, name: z.string().max(80), visible: z.boolean(), password: z.string().max(128).nullable() })).mutation(
    trpcify("api:create-global-channel", async ({ actor, name, visible, password }) => {
        const [{ insertId }] = await db.insert(tables.globalChannels).values({ name, visible, password });
        await audit(actor, "global/channels/create", null, { id: insertId, name, visible });
    }),
);
