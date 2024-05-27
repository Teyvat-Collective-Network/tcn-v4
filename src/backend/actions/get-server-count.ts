import { count } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import { proc } from "../trpc.js";

export default proc.output(z.number().int().min(0)).query(
    trpcify("api:get-server-count", async () => {
        const [{ number }] = await db.select({ number: count() }).from(tables.guilds);
        return number;
    }),
);
