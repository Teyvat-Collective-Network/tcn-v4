import { and, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import { proc } from "../trpc.js";

export default proc.query(
    trpcify("api:get-vote-tracker", async () => {
        const entries = await db
            .select({ poll: tables.expectedVoters.poll, expected: tables.expectedVoters.user, actual: tables.voteTracker.user })
            .from(tables.polls)
            .innerJoin(tables.expectedVoters, eq(tables.polls.id, tables.expectedVoters.poll))
            .leftJoin(tables.voteTracker, and(eq(tables.expectedVoters.poll, tables.voteTracker.poll), eq(tables.expectedVoters.user, tables.voteTracker.user)))
            .where(eq(tables.polls.closed, true));

        const data: Record<number, Record<string, boolean>> = {};

        for (const { poll, expected, actual } of entries) (data[poll] ??= {})[expected] = !!actual;

        return data;
    }),
);
