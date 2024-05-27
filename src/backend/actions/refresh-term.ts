import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ actor: zs.snowflake, user: zs.snowflake }))
    .output(z.string().nullable())
    .mutation(
        trpcify("api:refresh-term", async ({ actor, user }) => {
            await db
                .insert(tables.users)
                .values({ id: user })
                .onDuplicateKeyUpdate({ set: { id: user } });

            const [{ affectedRows }] = await db
                .update(tables.users)
                .set({ observerSince: Date.now() })
                .where(and(eq(tables.users.id, user), eq(tables.users.observer, true)));

            if (affectedRows === 0) return "This user is not an observer.";

            await audit(actor, "users/refresh-term", null, user, [user]);

            return null;
        }),
    );
