import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { proc } from "../trpc.js";

export default {
    getGuildName: proc
        .input(z.string())
        .output(z.string().nullable())
        .query(async ({ input: id }) => {
            return (await db.query.guilds.findFirst({ where: eq(tables.guilds.id, id) }))?.name ?? null;
        }),
};
