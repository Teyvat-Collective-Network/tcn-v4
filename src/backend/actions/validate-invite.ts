import { z } from "zod";
import { validateInvite } from "../lib/bot-lib.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ guild: zs.snowflake, invite: z.string() }))
    .output(z.string().nullable())
    .query(
        trpcify("api:validate-invite", async ({ guild, invite }) => {
            return await validateInvite(invite, guild);
        }),
    );
