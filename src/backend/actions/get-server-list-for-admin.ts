import { z } from "zod";
import { db } from "../db/db.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc.output(z.object({ id: zs.snowflake, name: z.string() }).array()).query(
    trpcify("api:get-server-list-for-admin", async () => {
        return await db.query.guilds.findMany({ columns: { id: true, name: true } });
    }),
);
