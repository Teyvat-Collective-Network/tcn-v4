import { z } from "zod";
import bot from "../bot.js";
import { proc } from "../trpc.js";
import trpcify from "../lib/trpcify.js";

export default proc
    .input(z.string())
    .output(z.string().nullable())
    .query(
        trpcify(async (id) => {
            return (await bot.users.fetch(id).catch(() => null))?.tag ?? null;
        }),
    );
