import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ user: zs.snowflake, answers: z.string().array() }))
    .output(z.string().nullable())
    .mutation(
        trpcify(async ({ user, answers }) => {
            if (answers[0] === "A")
                return "Q1: Banshares should not be used as a form of punishment. Please refer to the purpose subsection under the policy section.";
            else if (answers[0] !== "B") return "Q1: Unrecognized answer.";

            if (answers[1] === "B")
                return "Q2: The threshold for banshares is much higher than this. Please refer to the banshares subsection in the categories section and the report requirements in the policy section.";
            else if (answers[1] === "C")
                return "Q3: While repeated behavior is a factor that can escalate situations to banshares, not all repeated offenses need to be banshared. Banshares should be used in matters of server safety and when a user deserves no chances to redeem themselves.";
            else if (answers[1] !== "A") return "Q2: Unrecognized answer.";

            if (answers[2] === "A" || answers[2] === "C")
                return 'Q3: This is a suitable reason as it quickly describes the offense and a moderator looking through the audit logs would immediately understand why this user was banned. "Troll behavior", however, does not really explain the offense as it could mean many things and a moderator would need to look at the evidence to be able to understand the offense.';
            else if (answers[2] !== "B") return "Q3: Unrecognized answer.";

            await db
                .insert(tables.users)
                .values({ id: user, reportsQuizPassed: true })
                .onDuplicateKeyUpdate({ set: { reportsQuizPassed: true } });

            return null;
        }),
    );
