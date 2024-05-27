import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { fixUserRolesQueue } from "../queue.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ actor: zs.snowflake, user: zs.snowflake, observer: z.boolean() }))
    .output(z.string().nullable())
    .mutation(
        trpcify("api:set-observer", async ({ actor, user, observer }) => {
            await db
                .insert(tables.users)
                .values({ id: user })
                .onDuplicateKeyUpdate({ set: { id: user } });

            const [{ affectedRows }] = await db
                .update(tables.users)
                .set({ observer, observerSince: Date.now() })
                .where(and(eq(tables.users.id, user), eq(tables.users.observer, !observer)));

            if (affectedRows === 0) return observer ? "This user is already an observer." : "This user is not an observer.";

            await audit(actor, observer ? "users/promote" : "users/demote", null, user, [user]);
            await fixUserRolesQueue.add("", user);

            return null;
        }),
    );
