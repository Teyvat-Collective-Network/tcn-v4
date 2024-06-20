import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { trackMetrics } from "../../lib/metrics.js";

type Message = Exclude<Awaited<ReturnType<typeof db.query.globalMessages.findFirst>>, undefined>;

export async function augmentGlobalMessageContent(message: Message, guilds: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    const prefixes = new Map<string, string>();

    if (message.replyTo !== null) {
        await trackMetrics("global:relay:get-references", async () => {
            const references = await db
                .select({
                    replyUsername: tables.globalMessages.replyUsername,
                    guild: tables.globalMessageInstances.guild,
                    channel: tables.globalMessageInstances.channel,
                    message: tables.globalMessageInstances.message,
                })
                .from(tables.globalMessages)
                .leftJoin(tables.globalMessageInstances, eq(tables.globalMessages.id, tables.globalMessageInstances.ref))
                .where(eq(tables.globalMessages.id, message.replyTo!));

            if (references[0].guild)
                for (const reference of references) {
                    if (reference.guild === message.originGuild) continue;

                    prefixes.set(
                        reference.guild!,
                        `${process.env.EMOJI_GLOBAL_REPLY} ${reference.replyUsername ? `${reference.replyUsername}: ` : ""}https://discord.com/channels/${
                            reference.guild
                        }/${reference.channel}/${reference.message}\n`,
                    );
                }
        });
    }

    const messageInstances = new Map<string, Map<string, string>>();

    await trackMetrics("global:relay:find-instances", async () => {
        for (const match of message.content.matchAll(/https:\/\/(\w+\.)?discord\.com\/channels\/\d+\/\d+\/(\d+)/g))
            try {
                const id = match[2];
                if (messageInstances.has(id)) return;

                const source = alias(tables.globalMessageInstances, "source");

                const instances = await db
                    .select({
                        guild: tables.globalMessageInstances.guild,
                        channel: tables.globalMessageInstances.channel,
                        message: tables.globalMessageInstances.message,
                    })
                    .from(tables.globalMessageInstances)
                    .innerJoin(source, eq(tables.globalMessageInstances.ref, source.ref))
                    .where(eq(source.message, id));

                messageInstances.set(
                    id,
                    new Map(
                        instances.map((instance) => [instance.guild, `https://discord.com/channels/${instance.guild}/${instance.channel}/${instance.message}`]),
                    ),
                );
            } catch {}
    });

    for (const guild of guilds)
        results.set(
            guild,
            `${
                message.replyTo === null ? "" : prefixes.get(guild) ?? `${process.env.EMOJI_GLOBAL_REPLY} **[original not found]**\n`
            }${message.content.replaceAll(/https:\/\/(\w+\.)?discord\.com\/channels\/\d+\/\d+\/\d+/g, (match) => {
                const id = match.split("/").at(-1)!;
                return messageInstances.get(id)?.get(guild) ?? match;
            })}`,
        );

    return results;
}
