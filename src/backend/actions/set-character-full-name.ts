import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { syncPartnerLists } from "../modules/autosync/index.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ id: zs.id, name: z.string().max(64) }))
    .output(z.boolean())
    .mutation(
        trpcify("api:set-character-full-name", async ({ id, name }) => {
            try {
                const [{ affectedRows }] = await db.update(tables.characters).set({ name }).where(eq(tables.characters.id, id));

                if (affectedRows === 0) throw null;

                syncPartnerLists();

                return true;
            } catch {
                return false;
            }
        }),
    );
