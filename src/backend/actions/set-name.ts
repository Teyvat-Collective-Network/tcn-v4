import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { syncPartnerLists } from "../modules/autosync/index.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ actor: zs.snowflake, guild: zs.snowflake, name: z.string().trim().min(1).max(80) }))
    .output(z.string().nullable())
    .mutation(
        trpcify(async ({ actor, guild, name }) => {
            const obj = await db.query.guilds.findFirst({ columns: { name: true }, where: eq(tables.guilds.id, guild) });
            if (!obj) return "Guild not found.";

            await db.update(tables.guilds).set({ name }).where(eq(tables.guilds.id, guild));
            await audit(actor, "guilds/update/name", guild, [obj.name, name]);

            syncPartnerLists();

            return null;
        }),
    );
