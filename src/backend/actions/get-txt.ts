import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.string())
    .output(z.string().nullable())
    .query(
        trpcify(async (uuid) => {
            const entry = await db.query.txts.findFirst({ columns: { content: true }, where: eq(tables.txts.uuid, uuid) });
            return entry?.content ?? null;
        }),
    );
