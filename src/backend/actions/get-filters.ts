import { db } from "../db/db.js";
import trpcify from "../lib/trpcify.js";
import { proc } from "../trpc.js";

export default proc.query(
    trpcify("api:get-filters", async () => {
        return await db.query.globalFilters.findMany();
    }),
);
