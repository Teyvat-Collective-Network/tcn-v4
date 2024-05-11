import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc.input(z.object({ actor: zs.snowflake, user: zs.snowflake, name: z.string().max(40) })).mutation(
    trpcify(async ({ actor, user, name }) => {
        await db
            .insert(tables.users)
            .values({ id: user, globalNickname: name || null })
            .onDuplicateKeyUpdate({ set: { globalNickname: name || null } });

        await audit(actor, "users/update/global-nickname", null, { user, name }, [user]);
    }),
);
