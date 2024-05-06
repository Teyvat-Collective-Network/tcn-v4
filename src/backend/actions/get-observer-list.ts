import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { proc } from "../trpc.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";

export default proc.output(zs.snowflakes).query(
    trpcify(async () => {
        const users = await db.query.users.findMany({ columns: { id: true }, where: eq(tables.users.observer, true) });
        return users.map((user) => user.id);
    }),
);
