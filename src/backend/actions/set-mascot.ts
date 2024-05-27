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
    .input(z.object({ actor: zs.snowflake, guild: zs.snowflake, mascot: zs.id }))
    .output(z.boolean())
    .mutation(
        trpcify("api:set-mascot", async ({ actor, guild, mascot }) => {
            try {
                const obj = await db.query.guilds.findFirst({ columns: { mascot: true }, where: eq(tables.guilds.id, guild) });
                if (!obj) return false;

                await db.update(tables.guilds).set({ mascot }).where(eq(tables.guilds.id, guild));
                await audit(actor, "guilds/update/mascot", guild, [obj.mascot, mascot]);

                syncPartnerLists();
            } catch {
                return false;
            }

            return true;
        }),
    );
