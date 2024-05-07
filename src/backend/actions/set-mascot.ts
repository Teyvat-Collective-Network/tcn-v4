import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ guild: zs.snowflake, mascot: zs.id }))
    .output(z.boolean())
    .mutation(
        trpcify(async ({ guild, mascot }) => {
            try {
                const [{ affectedRows }] = await db.update(tables.guilds).set({ mascot }).where(eq(tables.guilds.id, guild));
                if (affectedRows === 0) return false;
            } catch {
                return false;
            }

            return true;
        }),
    );
