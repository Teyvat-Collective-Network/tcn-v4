import { BaseMessageOptions, ChannelType } from "discord.js";
import { api } from "../../api.js";
import bot from "../../bot.js";

export async function logBanshareExecutionIfDone(guild: string, message: string) {
    const { tasks, details } = await api.getAllBanTasksIfAllDone.query({ guild: guild, message: message });

    if (tasks)
        try {
            const banned: string[] = [];
            const failed: string[] = [];
            const skipped: string[] = [];

            for (const { status, user } of tasks) {
                if (status === "banned") banned.push(user);
                else if (status === "errored") failed.push(user);
                else if (status === "skipped") skipped.push(user);
            }

            const prefix = `TCN Banshare Executed: https://discord.com/channels/${guild}/${details?.channel}/${details?.location}\nExecuted by: ${
                details?.executor ? `<@${details.executor}>` : "Autoban"
            }`;

            const defaultText = `${prefix}\nBanned: ${banned.map((id) => `<@${id}>`).join(" ") || "N/A"}\nFailed: ${
                failed.map((id) => `<@${id}>`).join(" ") || "N/A"
            }\nSkipped: ${skipped.map((id) => `<@${id}>`).join(" ") || "N/A"}`;

            const post: BaseMessageOptions =
                defaultText.length > 2000
                    ? {
                          content: prefix,
                          files: [
                              {
                                  name: "logs.txt",
                                  attachment: Buffer.from(
                                      `Banned: ${banned.join(" ") || "N/A"}\nFailed: ${failed.join(" ") || "N/A"}\nSkipped: ${skipped.join(" ") || "N/A"}`,
                                  ),
                              },
                          ],
                      }
                    : { content: defaultText };

            const ids = await api.getBanshareLogChannels.query(guild);
            let logged = false;

            for (const id of ids)
                try {
                    const channel = await bot.channels.fetch(id);
                    if (channel?.type !== ChannelType.GuildText) throw 0;
                    await channel.send(post);
                    logged = true;
                } catch {}

            if (!logged)
                try {
                    const id = await api.getBanshareOutputChannel.query(guild);
                    if (!id) throw 0;
                    const channel = await bot.channels.fetch(id);
                    if (channel?.type !== ChannelType.GuildText) throw 0;
                    await channel.send(post);
                } catch {}
        } catch {}
}
