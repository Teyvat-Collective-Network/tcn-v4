import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { trackMetrics } from "../../lib/metrics.js";

export async function augmentGlobalMessageContent(content: string, guilds: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    const messageInstances = new Map<string, Map<string, string>>();

    await trackMetrics("global:relay:find-instances", async () => {
        for (const match of content.matchAll(/https:\/\/(\w+\.)?discord\.com\/channels\/\d+\/\d+\/(\d+)/g))
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
            content.replaceAll(/https:\/\/(\w+\.)?discord\.com\/channels\/\d+\/\d+\/\d+/g, (match) => {
                const id = match.split("/").at(-1)!;
                return messageInstances.get(id)?.get(guild) ?? match;
            }),
        );

    return results;
}
