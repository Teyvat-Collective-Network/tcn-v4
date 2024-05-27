import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { channels } from "../bot.js";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { isCouncil } from "../lib/api-lib.js";
import { registerVote, renderPoll } from "../lib/polls.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ token: z.string(), ranked: zs.snowflakes, countered: zs.snowflakes }))
    .output(z.string().nullable())
    .mutation(
        trpcify("api:submit-election-vote", async ({ token, ranked, countered }) => {
            if (
                ranked.length > new Set(ranked).size ||
                countered.length > new Set(countered).size ||
                ranked.some((id) => countered.includes(id)) ||
                countered.some((id) => ranked.includes(id))
            )
                return "Invalid data provided. Please report this as a bug.";

            let data: { type: string; id: number; user: string; time: number };

            try {
                data = jwt.verify(token, process.env.JWT_SECRET!) as any;
                if (data.type !== "election-vote") throw null;
            } catch {
                return "Invalid token provided.";
            }

            if (data.time < Date.now() - 1800000) throw "Token has expired. Please go back to the poll and click the button again.";
            if (!(await isCouncil(data.user))) throw "You are not authorized to vote in this election.";

            const { id } = data;

            const [poll] = await db
                .select({
                    candidates: tables.electionPolls.candidates,
                    closed: tables.polls.closed,
                    message: tables.polls.message,
                })
                .from(tables.polls)
                .innerJoin(tables.electionPolls, eq(tables.polls.id, tables.electionPolls.ref))
                .where(eq(tables.polls.id, id));

            if (!poll) throw "Poll not found (invalid ID in URL).";
            if (poll.closed) throw "This poll is already closed.";

            const candidates = poll.candidates as string[];

            if ([...ranked, ...countered].some((id) => !candidates.includes(id))) throw "Invalid candidate provided. This is likely a bug.";

            await db
                .insert(tables.electionVotes)
                .values({ ref: id, user: data.user, vote: { ranked, countered } })
                .onDuplicateKeyUpdate({ set: { vote: { ranked, countered } } });

            await registerVote(id, data.user);

            try {
                const message = await channels.voteHere.messages.fetch(poll.message);
                await message.edit(await renderPoll(id));
            } catch {}

            return null;
        }),
    );
