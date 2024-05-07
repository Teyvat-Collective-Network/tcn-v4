import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { validateInvite } from "../lib/bot-lib.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ guild: zs.snowflake, invite: z.string() }))
    .output(z.string().nullable())
    .mutation(
        trpcify(async ({ guild, invite }) => {
            const error = await validateInvite(invite, guild);
            if (error) return error;

            const [{ affectedRows }] = await db.update(tables.guilds).set({ invite }).where(eq(tables.guilds.id, guild));
            if (affectedRows === 0) return "Guild not found.";

            return null;
        }),
    );
