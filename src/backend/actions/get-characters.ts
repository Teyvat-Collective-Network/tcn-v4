import { db } from "../db/db.js";
import trpcify from "../lib/trpcify.js";
import { proc } from "../trpc.js";

export default proc.query(
    trpcify(async () => {
        return await db.query.characters.findMany();
    }),
);
