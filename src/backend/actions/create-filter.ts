import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc.input(z.object({ actor: zs.snowflake, name: z.string().max(80) })).mutation(
    trpcify("api:create-filter", async ({ actor, name }) => {
        await db.insert(tables.globalFilters).values({ name });
        await audit(actor, "global/filter/create", null, name);

        return null;
    }),
);
