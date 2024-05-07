import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ guild: zs.snowflake, name: z.string().trim().min(1).max(80) }))
    .output(z.string().nullable())
    .mutation(
        trpcify(async ({ guild, name }) => {
            const [{ affectedRows }] = await db.update(tables.guilds).set({ name }).where(eq(tables.guilds.id, guild));
            if (affectedRows === 0) return "Guild not found.";

            return null;
        }),
    );
