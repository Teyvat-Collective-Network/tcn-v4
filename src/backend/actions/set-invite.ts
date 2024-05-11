import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import { validateInvite } from "../lib/bot-lib.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ actor: zs.snowflake, guild: zs.snowflake, invite: z.string() }))
    .output(z.string().nullable())
    .mutation(
        trpcify(async ({ actor, guild, invite }) => {
            const obj = await db.query.guilds.findFirst({ columns: { invite: true }, where: eq(tables.guilds.id, guild) });
            if (!obj) return "Guild not found.";

            const error = await validateInvite(invite, guild);
            if (error) return error;

            await db.update(tables.guilds).set({ invite }).where(eq(tables.guilds.id, guild));
            await audit(actor, "guilds/update/invite", guild, [obj.invite, invite]);

            return null;
        }),
    );
