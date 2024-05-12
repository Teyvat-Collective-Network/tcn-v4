import { and, eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { isCouncil } from "../lib/api-lib.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.string())
    .output(
        z.object({
            error: z.string().nullable(),
            wave: z.number().int(),
            seats: z.number().int(),
            candidates: zs.snowflakes,
            ranked: zs.snowflakes,
            countered: zs.snowflakes,
            token: z.string(),
        }),
    )
    .query(
        trpcify(async (token) => {
            try {
                let data: { type: string; id: number; user: string; time: number };

                try {
                    data = jwt.verify(token, process.env.JWT_SECRET!) as any;
                    if (data.type !== "election-open") throw null;
                } catch {
                    throw "Invalid token provided.";
                }

                if (data.time < Date.now() - 60000) throw "Token has expired. Please go back to the poll and click the button again.";
                if (!(await isCouncil(data.user))) throw "You are not authorized to vote in this election.";

                const { id } = data;

                const [poll] = await db
                    .select({
                        wave: tables.elections.wave,
                        seats: tables.elections.seats,
                        candidates: tables.electionPolls.candidates,
                        closed: tables.polls.closed,
                    })
                    .from(tables.polls)
                    .innerJoin(tables.electionPolls, eq(tables.polls.id, tables.electionPolls.ref))
                    .innerJoin(tables.elections, eq(tables.electionPolls.thread, tables.elections.channel))
                    .where(eq(tables.polls.id, id));

                if (!poll) throw "Poll not found (invalid ID in URL).";
                if (poll.closed) throw "This poll is already closed.";

                const entry = (await db.query.electionVotes.findFirst({
                    columns: { vote: true },
                    where: and(eq(tables.electionVotes.ref, +id), eq(tables.electionVotes.user, data.user)),
                })) ?? { vote: { ranked: [], countered: [] } };

                const vote = entry.vote as { ranked: string[]; countered: string[] };

                return {
                    error: null,
                    wave: poll.wave,
                    seats: poll.seats,
                    candidates: poll.candidates as string[],
                    ranked: vote.ranked,
                    countered: vote.countered,
                    token: jwt.sign({ type: "election-vote", id, user: data.user, time: Date.now() }, process.env.JWT_SECRET!),
                };
            } catch (error) {
                if (typeof error !== "string") {
                    console.error(error);
                    error = "An unexpected error occurred. This has been logged.";
                }

                return { error: `${error}`, wave: -1, seats: -1, id: -1, candidates: [], ranked: [], countered: [], token: "" };
            }
        }),
    );
