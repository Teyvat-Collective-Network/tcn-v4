import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { proc } from "../trpc.js";

export default {
    getBasicUserInfo: proc
        .input(z.string())
        .output(z.object({ staff: z.boolean(), globalMod: z.boolean(), council: z.boolean(), advisor: z.boolean(), owner: z.boolean(), observer: z.boolean() }))
        .query(async ({ input: id }) => {
            const user = await db.query.users.findFirst({
                columns: { staff: true, globalMod: true, advisor: true, owner: true, observer: true },
                where: eq(tables.users.id, id),
            });

            if (!user) return { staff: false, globalMod: false, council: false, advisor: false, owner: false, observer: false };

            return { ...user, council: user.owner || user.advisor };
        }),
};
