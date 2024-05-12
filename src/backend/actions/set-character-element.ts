import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ id: zs.id, element: z.string().max(32) }))
    .output(z.boolean())
    .mutation(
        trpcify(async ({ id, element }) => {
            try {
                const [{ affectedRows }] = await db.update(tables.characters).set({ element }).where(eq(tables.characters.id, id));

                if (affectedRows === 0) throw null;

                return true;
            } catch {
                return false;
            }
        }),
    );
