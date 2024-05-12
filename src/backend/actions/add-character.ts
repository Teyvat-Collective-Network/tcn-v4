import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ id: zs.id, short: z.string().max(32), name: z.string().max(64), element: z.string().max(32) }))
    .output(z.boolean())
    .mutation(
        trpcify(async ({ id, short, name, element }) => {
            try {
                await db.insert(tables.characters).values({ id, short: short || null, name, element });
                return true;
            } catch {
                return false;
            }
        }),
    );
