import { BaseMessageOptions, ChannelType, Guild, TextChannel, Webhook, escapeMarkdown } from "discord.js";
import { and, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import globalBot from "../global-bot.js";
import { trackMetrics } from "./metrics.js";

export async function logToChannel(id: string, message: BaseMessageOptions | string, userId?: string) {
    await trackMetrics("global:log-to-channel", async () => {
        try {
            if (!id) return;

            const channel = await globalBot.channels.fetch(id).catch(() => null);
            if (channel?.type !== ChannelType.GuildText) return;

            const post = await channel.send(message);

            if (userId) await db.insert(tables.auxGlobalAuthors).values({ message: post.id, user: userId });

            return post;
        } catch {}
    });
}

let globalWebhooks: Set<string>;

async function loadGlobalWebhooks() {
    globalWebhooks ??= new Set((await db.query.globalWebhookTracker.findMany()).map((x) => x.webhook));
}

export async function getWebhook(channel: TextChannel): Promise<Webhook | null> {
    return await trackMetrics("global:get-webhook", async () => {
        const webhooks = await channel.fetchWebhooks().catch(() => null);

        const webhook =
            webhooks?.find((webhook) => !webhook.applicationId) ??
            webhooks?.find((webhook) => webhook.owner?.id === channel.client.user.id) ??
            (await channel.createWebhook({ name: "Global Chat Webhook (Please Replace)" }).catch(() => null));

        if (webhook) {
            await db
                .insert(tables.globalWebhookTracker)
                .values({ webhook: webhook.id })
                .onDuplicateKeyUpdate({ set: { webhook: webhook.id } });

            await loadGlobalWebhooks();
            globalWebhooks.add(webhook.id);
        }

        return webhook;
    });
}

export async function isGlobalWebhook(id: string | null) {
    if (!id) return false;

    return await trackMetrics("global:is-global-webhook", async () => {
        await loadGlobalWebhooks();
        return globalWebhooks.has(id);
    });
}

export async function logDeletion(
    guild: Guild,
    instance: { id: number; content: string; embeds: any; attachments: any; logs: string | null; author: string; username: string },
) {
    await trackMetrics("global:log-deletion", async () => {
        const embeds: any = instance.embeds ?? [];
        const attachments: any = instance.attachments ?? [];

        if (embeds.length > 9)
            if (attachments.length > 9) {
                attachments.splice(0, attachments.length, { name: "data.json", attachment: Buffer.from(JSON.stringify({ embeds, attachments }, null, 4)) });
            } else attachments.push({ name: "embeds.json", attachment: Buffer.from(JSON.stringify(embeds, null, 4)) });

        const [{ affectedRows }] = await db
            .update(tables.globalMessages)
            .set({ deleted: true })
            .where(and(eq(tables.globalMessages.id, instance.id), eq(tables.globalMessages.deleted, false)));

        if (affectedRows > 0 && instance.logs)
            await logToChannel(
                instance.logs,
                {
                    content: `Message from <@${instance.author}> (webhook username: **${escapeMarkdown(instance.username)}**) deleted in **${escapeMarkdown(
                        guild.name,
                    )}**`,
                    embeds: [
                        {
                            title: "Message Deleted",
                            description: instance.content,
                        },
                        ...(embeds.length > 9 ? [] : embeds),
                    ],
                    files: attachments,
                },
                instance.author,
            );
    });
}
