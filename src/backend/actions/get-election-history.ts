import { db } from "../db/db.js";
import trpcify from "../lib/trpcify.js";
import { proc } from "../trpc.js";

export default proc.query(
    trpcify(async () => {
        return {
            entries: await db.query.electionHistory.findMany(),
            seats: Object.fromEntries((await db.query.elections.findMany({ columns: { wave: true, seats: true } })).map((entry) => [entry.wave, entry.seats])),
        };
    }),
);
