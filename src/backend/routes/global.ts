import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { proc } from "../trpc.js";

export default {
    globalBan: proc.input(z.object({ channel: z.number().int().min(1), users: z.string().array() })).mutation(async ({ input: { channel, users } }) => {
        await db
            .insert(tables.globalBans)
            .values(users.map((user) => ({ channel, user })))
            .onDuplicateKeyUpdate({ set: { channel } })
            .catch(() => null);
    }),
};
