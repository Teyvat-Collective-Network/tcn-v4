import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ old: zs.id, set: zs.id }))
    .output(z.boolean())
    .mutation(
        trpcify(async ({ old, set }) => {
            try {
                const [{ affectedRows }] = await db.update(tables.characters).set({ id: set }).where(eq(tables.characters.id, old));
                if (affectedRows === 0) throw null;

                return true;
            } catch {
                return false;
            }
        }),
    );
