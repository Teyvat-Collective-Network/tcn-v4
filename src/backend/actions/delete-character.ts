import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(zs.id)
    .output(z.boolean())
    .mutation(
        trpcify(async (id) => {
            if (!!(await db.query.guilds.findFirst({ where: eq(tables.guilds.mascot, id) }))) return false;

            await db.delete(tables.characters).where(eq(tables.characters.id, id));

            return true;
        }),
    );
