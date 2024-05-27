import { BaseMessageOptions } from "discord.js";
import { eq, not } from "drizzle-orm";
import bot, { channels } from "../../bot.js";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { getHubAndNormalPartnerList } from "../../lib/bot-lib.js";

export async function syncPartnerList(
    entry:
        | {
              guild: string;
              location: "disabled" | "channel" | "webhook";
              channel: string | null;
              webhook: string | null;
              message: string | null;
              repost: boolean;
          }
        | null
        | undefined,
    data: BaseMessageOptions,
) {
    if (!entry) throw "Autosync is not set up in this server.";
    if (entry.location === "disabled") throw "Autosync is disabled in this server.";

    if (entry.location === "channel") {
        if (!entry.channel) throw "Invalid configuration.";

        const channel = await bot.channels.fetch(entry.channel);
        if (!channel?.isTextBased()) throw "Channel could not be fetched. Please check permissions or set the channel again.";

        const message = entry.message ? await channel.messages.fetch(entry.message).catch(() => null) : null;

        if (message)
            if (entry.repost) await message.delete().catch(() => null);
            else await message.edit(data);

        if (!message || entry.repost) {
            const newMessage = await channel.send(data);
            await db.update(tables.autosyncSettings).set({ message: newMessage.id }).where(eq(tables.autosyncSettings.guild, entry.guild));
        }
    } else if (entry.location === "webhook") {
        if (!entry.webhook) throw "Invalid configuration.";

        if (!entry.repost) {
            const editReq = await fetch(`${entry.webhook}/messages/${entry.message}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (editReq.ok) return;
        } else fetch(`${entry.webhook}/messages/${entry.message}`, { method: "DELETE" });

        const sendReq = await fetch(`${entry.webhook}?wait=true`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!sendReq.ok) throw "Could not send webhook message. Make sure the webhook still exists.";

        const { id } = (await sendReq.json()) as { id: string };

        await db.update(tables.autosyncSettings).set({ message: id }).where(eq(tables.autosyncSettings.guild, entry.guild));
    }
}

export async function syncPartnerLists() {
    try {
        const entry = await db.query.hubPartnerListLocation.findFirst();

        if (entry) {
            const message = await channels.hubPartnerList.messages.fetch(entry.message).catch(() => null);
            message?.delete();
        }

        const [hubData, data] = await getHubAndNormalPartnerList();

        const hubMessage = await channels.hubPartnerList.send(hubData);

        await db
            .insert(tables.hubPartnerListLocation)
            .values({ id: 0, message: hubMessage.id })
            .onDuplicateKeyUpdate({ set: { message: hubMessage.id } });

        const settings = await db.query.autosyncSettings.findMany({ where: not(eq(tables.autosyncSettings.location, "disabled")) });

        for (const entry of settings) await syncPartnerList(entry, data).catch(() => null);
    } catch (error) {
        channels.logs.send({
            content: `<@&${process.env.ROLE_TECH_TEAM}> An error occurred syncing partner lists: ${error}`,
            allowedMentions: { roles: [process.env.ROLE_TECH_TEAM!] },
        });
        console.error(error);
    }
}
