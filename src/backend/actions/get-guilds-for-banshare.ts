import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(zs.snowflake)
    .output(z.object({ id: zs.snowflake, name: z.string() }).array())
    .query(
        trpcify(async (id) => {
            return await db
                .selectDistinct({ id: tables.guilds.id, name: tables.guilds.name })
                .from(tables.guilds)
                .leftJoin(tables.guildStaff, eq(tables.guilds.id, tables.guildStaff.guild))
                .where(or(eq(tables.guilds.owner, id), eq(tables.guilds.advisor, id), eq(tables.guildStaff.user, id)));
        }),
    );
