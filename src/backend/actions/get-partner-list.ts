import { z } from "zod";
import { db } from "../db/db.js";
import { proc } from "../trpc.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";

export default proc.output(z.object({ id: zs.snowflake, mascot: zs.id, name: z.string(), invite: z.string(), image: z.string() }).array()).query(
    trpcify(async () => {
        return await db.query.guilds.findMany({ columns: { id: true, mascot: true, name: true, invite: true, image: true } });
    }),
);
