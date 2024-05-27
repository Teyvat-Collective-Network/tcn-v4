import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc.input(zs.snowflake).query(
    trpcify("api:get-guild", async (id) => {
        return (await db.query.guilds.findFirst({ where: eq(tables.guilds.id, id) })) ?? null;
    }),
);
