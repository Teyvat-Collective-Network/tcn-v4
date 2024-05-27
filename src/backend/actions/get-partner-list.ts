import { asc } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc.output(z.object({ id: zs.snowflake, mascot: zs.id, name: z.string(), invite: z.string(), image: z.string() }).array()).query(
    trpcify("api:get-partner-list", async () => {
        return await db.query.guilds.findMany({ columns: { id: true, mascot: true, name: true, invite: true, image: true }, orderBy: asc(tables.guilds.name) });
    }),
);
