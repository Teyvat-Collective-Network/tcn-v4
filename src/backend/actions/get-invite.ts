import { z } from "zod";
import bot from "../bot.js";
import { validateInvite } from "../lib/bot-lib.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.string())
    .output(z.union([z.string(), z.object({ id: zs.snowflake, name: z.string(), image: z.string().nullable() })]))
    .query(
        trpcify("api:get-invite", async (query) => {
            const invite = await bot.fetchInvite(query).catch(() => null);

            const error = await validateInvite(invite);
            if (error) return error;

            const guild = invite!.guild!;

            return { id: guild.id, name: guild.name, image: guild.iconURL({ extension: "png", forceStatic: true, size: 256 }) };
        }),
    );
