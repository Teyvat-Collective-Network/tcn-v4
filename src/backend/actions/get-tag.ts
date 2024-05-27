import { z } from "zod";
import bot from "../bot.js";
import trpcify from "../lib/trpcify.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.string())
    .output(z.string().nullable())
    .query(
        trpcify("api:get-tag", async (id) => {
            return (await bot.users.fetch(id).catch(() => null))?.tag ?? null;
        }),
    );
