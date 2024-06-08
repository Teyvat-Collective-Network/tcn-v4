import { ChannelType } from "discord.js";
import bot from "../bot.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc.input(zs.snowflake).query(
    trpcify("api:get-global-connection-details", async (id) => {
        const channel = await bot.channels.fetch(id).catch(() => null);
        if (channel?.type !== ChannelType.GuildText) return null;
        await channel.guild.members.fetch();

        return {
            name: channel.name,
            guildName: channel.guild.name,
            users: channel.members.map((member) => ({ id: member.id, name: member.user.displayName, bot: member.user.bot })),
        };
    }),
);
