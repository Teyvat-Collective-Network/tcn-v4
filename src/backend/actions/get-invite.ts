import { z } from "zod";
import bot from "../bot.js";
import { proc } from "../trpc.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";

export default proc
    .input(z.string())
    .output(z.union([z.string(), z.object({ id: zs.snowflake, name: z.string(), image: z.string().nullable() })]))
    .query(
        trpcify(async (query) => {
            const invite = await bot.fetchInvite(query).catch(() => null);

            if (!invite) return "Invalid invite!";
            if (!invite.guild) return "That invite seems to not point to a server. Make sure you haven't entered a group DM invite.";
            if (!!invite.expiresAt) return "That invite is not permanent. Please generate an invite that will not expire.";
            if (invite.code === invite.guild.vanityURLCode)
                return "That invite is the server's vanity URL. Please generate a permanent invite that isn't the vanity.";

            return { id: invite.guild.id, name: invite.guild.name, image: invite.guild.iconURL({ extension: "png", forceStatic: true, size: 256 }) };
        }),
    );
