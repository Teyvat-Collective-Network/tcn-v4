import {
    BaseMessageOptions,
    ButtonStyle,
    ChannelType,
    ComponentType,
    Events,
    Message,
    MessageFlags,
    MessageType,
    PartialMessage,
    PermissionFlagsBits,
    Webhook,
    escapeMarkdown,
} from "discord.js";
import { and, eq, inArray, not } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { fstatSync, openSync } from "fs";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import globalBot from "../../global-bot.js";
import { englishList, escapeRegex } from "../../lib.js";
import { code } from "../../lib/bot-lib.js";
import { addFile } from "../../lib/files.js";
import { getWebhook, globalWebhookMap, isGlobalWebhook, logDeletion, logToChannel } from "../../lib/global.js";
import { trackMetrics } from "../../lib/metrics.js";
import stickerCache from "../../lib/sticker-cache.js";
import { GlobalChatRelayTask, GlobalChatTaskPriority, globalChatRelayQueue, makeWorker } from "../../queue.js";

const panicAlertCooldown = new Map<string, number>();

setInterval(() => {
    for (const key of panicAlertCooldown.keys()) if (panicAlertCooldown.get(key)! < Date.now() - 30000) panicAlertCooldown.delete(key);
}, 86400000);

function shouldPanicAlert(channel: string) {
    if (panicAlertCooldown.has(channel) && panicAlertCooldown.get(channel)! >= Date.now() - 30000) return false;

    panicAlertCooldown.set(channel, Date.now());
    return true;
}

const deleteButton = [
    {
        type: ComponentType.ActionRow,
        components: [
            {
                type: ComponentType.Button,
                customId: "delete-message",
                style: ButtonStyle.Danger,
                label: "Delete",
            },
        ],
    },
] satisfies BaseMessageOptions["components"];

const getEmbeds = (message: Message | PartialMessage) =>
    message.flags.has(MessageFlags.SuppressEmbeds) ? [] : message.embeds.filter((embed) => embed.data.type === "rich").map((embed) => embed.toJSON());

globalBot.on(Events.MessageCreate, async (message) => {
    if (!message.guild) return;
    if (message.flags.has(MessageFlags.SuppressNotifications) || message.flags.has(MessageFlags.Loading)) return;

    if (
        message.type !== MessageType.Default &&
        message.type !== MessageType.Reply &&
        message.type !== MessageType.ContextMenuCommand &&
        message.type !== MessageType.ChatInputCommand
    )
        return;

    if (await isGlobalWebhook(message.webhookId)) return;

    const connection = await db.query.globalConnections.findFirst({
        columns: { channel: true },
        where: eq(tables.globalConnections.location, message.channel.id),
    });

    if (!connection) return;

    const channel = await db.query.globalChannels.findFirst({
        columns: { id: true, panic: true, logs: true, infoOnUserPlugin: true, priority: true },
        where: eq(tables.globalChannels.id, connection.channel),
    });

    if (!channel) return;

    if (channel.panic) {
        if (shouldPanicAlert(message.channel.id))
            message.reply({
                content: "This channel is currently in panic mode. Messages and edits will not be forwarded.",
                flags: MessageFlags.SuppressNotifications,
            });
        return;
    }

    const banned = !!(await db.query.globalBans.findFirst({
        where: and(eq(tables.globalBans.channel, channel.id), eq(tables.globalBans.user, message.author.id)),
    }));

    if (banned) {
        message.author.send("You are banned from that global channel and cannot send messages to it.");
        message.delete().catch(() => null);
        return;
    }

    if (message.content.length > (message.type === MessageType.Reply ? 1800 : 2000)) {
        message.reply({
            content: "This message is too long (max accepted length is 1800 for replies and 2000 otherwise).",
            components: deleteButton,
            flags: MessageFlags.SuppressNotifications,
        });

        return;
    }

    if (message.stickers.size + message.attachments.size > 10) {
        message.reply({
            content:
                "Stickers must be converted to files and a message may only contain 10 messages. Please send only 10 files and stickers combined per message.",
            components: deleteButton,
            flags: MessageFlags.SuppressNotifications,
        });

        return;
    }

    const filters = await db
        .select({ term: tables.globalFilterTerms.term, regex: tables.globalFilterTerms.regex })
        .from(tables.globalAppliedFilters)
        .innerJoin(tables.globalFilterTerms, eq(tables.globalAppliedFilters.filter, tables.globalFilterTerms.filter))
        .where(eq(tables.globalAppliedFilters.channel, channel.id));

    const entry = await db.query.users.findFirst({ columns: { globalNickname: true }, where: eq(tables.users.id, message.author.id) });
    const guildEntry = await db.query.guilds.findFirst({ columns: { name: true }, where: eq(tables.guilds.id, message.guild.id) });

    const user = message.member ?? message.author;

    const username = `${(entry?.globalNickname ?? user.displayName).slice(0, 40)} from ${guildEntry?.name ?? message.guild.name}`.slice(0, 80);

    const replyUsername = `**${`${escapeMarkdown(entry?.globalNickname ?? user.displayName).slice(0, 40)}** from **${escapeMarkdown(
        guildEntry?.name ?? message.guild.name,
    )}`.slice(0, 76)}**`;

    for (const { term, regex } of filters)
        try {
            const re = regex
                ? new RegExp(term, "i")
                : new RegExp(
                      term.length === 1
                          ? escapeRegex(term)
                          : `\\b${term.startsWith("*") ? "w*?" : term[0]}${escapeRegex(term.slice(1, -1))}${term.endsWith("*") ? ".*?" : term.at(-1)}\\b`,
                      "i",
                  );

            let match = message.content.match(re)?.[0] ?? null;

            if (match) {
                message.delete().catch(() => null);
                message.author.send(`Your message was blocked by the global chat filter (the filtered term was: ${code(match)}).`);

                if (channel.logs)
                    await logToChannel(
                        channel.logs,
                        {
                            content: `Message from ${message.author} blocked in **${escapeMarkdown(message.guild.name)}**`,
                            embeds: [
                                {
                                    title: "Message Blocked",
                                    description: message.content,
                                    fields: [{ name: "Blocked Term", value: code(match) }],
                                },
                            ],
                        },
                        message.author.id,
                    );

                return;
            }

            match = username.match(re)?.[0] ?? null;

            if (match) {
                message.delete().catch(() => null);

                message.author.send(
                    `Your message was blocked by the global chat filter due to your display name (the filtered term was: ${code(
                        match,
                    )}). You can bypass this by using \`/global nickname\`.`,
                );

                if (channel.logs)
                    await logToChannel(
                        channel.logs,
                        {
                            content: `Message from ${message.author} blocked in **${escapeMarkdown(message.guild.name)}** due to their username`,
                            embeds: [
                                {
                                    title: "Message Blocked (Username)",
                                    description: username,
                                    fields: [{ name: "Blocked Term", value: code(match) }],
                                },
                            ],
                        },
                        message.author.id,
                    );

                return;
            }
        } catch {}

    const attachments = await Promise.all(
        message.attachments.map(async (attachment) => ({
            name: attachment.name,
            attachment: await addFile(attachment.url, `Triggered by sending of ${message.url} by ${message.author} in ${message.guild!.name}`),
            sticker: false,
        })),
    );

    for (const sticker of message.stickers.values()) {
        try {
            const path = await stickerCache.fetch(sticker);
            if (!path) throw null;
            if (fstatSync(openSync(path, "r")).size === 0) throw null;

            attachments.push({ name: `${sticker.name}.${stickerCache.ext(sticker)}`, attachment: path, sticker: true });
        } catch {
            message.reply({
                content:
                    "Your sticker could not be converted to a file to be sent. Unfortunately, Discord does not allow webhooks to send stickers, so this sticker cannot be relayed and your message has not been sent.",
                components: deleteButton,
                flags: MessageFlags.SuppressNotifications,
            });

            return;
        }
    }

    const [{ insertId }] = await db.insert(tables.globalMessages).values({
        channel: channel.id,
        author: message.author.id,
        replyTo:
            message.type === MessageType.Reply && message.reference?.messageId
                ? (
                      await db.query.globalMessageInstances.findFirst({
                          columns: { ref: true },
                          where: eq(tables.globalMessageInstances.message, message.reference.messageId),
                      })
                  )?.ref
                : null,
        originGuild: message.guild.id,
        originChannel: message.channel.id,
        originMessage: message.id,
        time: Date.now(),
        content: message.content,
        embeds: getEmbeds(message),
        attachments,
        username,
        replyUsername,
        avatar: user.displayAvatarURL({ extension: "png", size: 256 }),
    });

    await db.insert(tables.globalMessageInstances).values({ ref: insertId, guild: message.guild.id, channel: message.channel.id, message: message.id });

    const connections = await db.query.globalConnections.findMany({
        columns: { guild: true, location: true },
        where: and(eq(tables.globalConnections.channel, channel.id), not(eq(tables.globalConnections.location, message.channel.id))),
    });

    if (process.env.VERBOSE) console.log(`[GLOBAL] Relaying message to ${connections.length - 1} guild(s).`);

    await globalChatRelayQueue.add(
        "",
        { type: "post", id: insertId, locations: connections },
        {
            priority:
                channel.priority === "low"
                    ? GlobalChatTaskPriority.PostLowPriority
                    : channel.priority === "normal"
                    ? GlobalChatTaskPriority.PostMediumPriority
                    : GlobalChatTaskPriority.PostHighPriority,
        },
    );

    if (channel.infoOnUserPlugin && message.content.match(/info.*on.*[1-9][0-9]{16,19}/im)) {
        const reply = await message.reply({
            components: [
                {
                    type: ComponentType.ActionRow,
                    components: [
                        {
                            type: ComponentType.Button,
                            style: ButtonStyle.Success,
                            customId: "create-info-on-user",
                            label: "Set up info-on-user request utility",
                        },
                        {
                            type: ComponentType.Button,
                            style: ButtonStyle.Danger,
                            customId: "delete",
                            label: "Delete",
                        },
                    ],
                },
            ],
            flags: MessageFlags.SuppressNotifications,
        });

        const response = await reply
            .awaitMessageComponent({
                time: 5 * 60 * 1000,
                filter: (x) => x.user.id === message.author.id,
                componentType: ComponentType.Button,
            })
            .catch(() => null);

        reply.delete().catch(() => null);

        if (response?.customId !== "create-info-on-user") return;

        const now = await db.query.globalMessages.findFirst({ where: eq(tables.globalMessages.id, insertId) });
        if (!now || now.deleted) return;

        await globalChatRelayQueue.add("", { type: "start-info-on-user", ref: insertId }, { priority: GlobalChatTaskPriority.PostHighPriority });
    }
});

globalBot.on(Events.MessageDelete, async (message) => {
    const [instance] = await db
        .select({
            id: tables.globalMessages.id,
            author: tables.globalMessages.author,
            username: tables.globalMessages.username,
            content: tables.globalMessages.content,
            embeds: tables.globalMessages.embeds,
            attachments: tables.globalMessages.attachments,
            logs: tables.globalChannels.logs,
        })
        .from(tables.globalMessageInstances)
        .innerJoin(tables.globalMessages, eq(tables.globalMessageInstances.ref, tables.globalMessages.id))
        .innerJoin(tables.globalChannels, eq(tables.globalMessages.channel, tables.globalChannels.id))
        .where(and(eq(tables.globalMessageInstances.message, message.id), eq(tables.globalMessages.deleted, false)));

    if (!instance) return;

    await logDeletion(message.guild!, instance);

    if (process.env.VERBOSE) console.log("[GLOBAL] Triggering deletion.");

    await globalChatRelayQueue.add(
        "",
        { type: "start-delete", objects: [{ ref: instance.id, guild: message.guild!.id, channel: message.channel.id, message: message.id }] },
        { priority: GlobalChatTaskPriority.Delete },
    );
});

globalBot.on(Events.MessageBulkDelete, async (messages) => {
    const instances = await db
        .select({
            ref: tables.globalMessageInstances.ref,
            guild: tables.globalMessageInstances.guild,
            channel: tables.globalMessageInstances.channel,
            message: tables.globalMessageInstances.message,
            logs: tables.globalChannels.logs,
        })
        .from(tables.globalMessageInstances)
        .innerJoin(tables.globalMessages, eq(tables.globalMessageInstances.ref, tables.globalMessages.id))
        .innerJoin(tables.globalChannels, eq(tables.globalMessages.channel, tables.globalChannels.id))
        .where(and(inArray(tables.globalMessageInstances.message, [...messages.keys()]), eq(tables.globalMessages.deleted, false)));

    if (instances.length === 0) return;

    const groups: Record<string, typeof instances> = {};

    for (const instance of instances) if (instance.logs) (groups[instance.logs] ??= []).push(instance);

    const guild = messages.first()!.guild!;

    for (const [logs, instances] of Object.entries(groups))
        await logToChannel(logs, {
            embeds: [
                {
                    title: "Bulk Deletion",
                    description: `${instances.length} message${instances.length === 1 ? " was" : "s were"} bulk deleted from **${escapeMarkdown(
                        guild.name,
                    )}** (\`${guild.id}\`).`,
                    color: 0x2b2d31,
                },
            ],
            files: [{ name: "deleted-messages.json", attachment: Buffer.from(JSON.stringify(instances, null, 4)) }],
        });

    if (process.env.VERBOSE) console.log(`[GLOBAL] Triggering bulk deletion (${instances.length} item(s)).`);

    await globalChatRelayQueue.add("", { type: "start-delete", objects: instances }, { priority: GlobalChatTaskPriority.Delete });
});

globalBot.on(Events.MessageUpdate, async (before, after) => {
    if (!after.guild) return;
    const contentUpdated = before.content !== after.content;

    const embedsBefore = getEmbeds(before);
    const embedsAfter = getEmbeds(after);

    const embedsUpdated = JSON.stringify(embedsBefore) !== JSON.stringify(embedsAfter);
    const attachmentsUpdated = before.attachments.size !== after.attachments.size;

    if (!contentUpdated && !embedsUpdated && !attachmentsUpdated) return;

    const [instance] = await db
        .select({
            id: tables.globalMessages.id,
            attachments: tables.globalMessages.attachments,
            panic: tables.globalChannels.panic,
            content: tables.globalMessages.content,
            embeds: tables.globalMessages.embeds,
            logs: tables.globalChannels.logs,
            author: tables.globalMessages.author,
            username: tables.globalMessages.username,
            deleted: tables.globalMessages.deleted,
        })
        .from(tables.globalMessages)
        .innerJoin(tables.globalChannels, eq(tables.globalMessages.channel, tables.globalChannels.id))
        .where(eq(tables.globalMessages.originMessage, before.id));

    if (!instance || instance.deleted || instance.panic) return;

    if (!after.content && embedsAfter.length === 0 && after.attachments.size === 0 && after.stickers.size === 0) {
        logDeletion(after.guild, instance);
        after.delete().catch(() => null);
        return;
    }

    if (instance.logs)
        await logToChannel(
            instance.logs,
            {
                embeds: [
                    ...(instance.content === (after.content || "")
                        ? []
                        : [
                              { title: "Message Updated (Before)", description: instance.content, color: 0x2b2d31 },
                              { title: "Message Updated (After)", description: after.content || "", color: 0x2b2d31 },
                          ]),
                    ...(attachmentsUpdated
                        ? [
                              {
                                  title: "Old Attachments",
                                  description: ((instance.attachments as any[]) ?? [])
                                      .map((attachment: any) => `[${escapeMarkdown(attachment.name)}](${attachment.attachment})`)
                                      .join("\n"),
                                  color: 0x2b2d31,
                              },
                          ]
                        : []),
                ],
                files: [
                    ...(embedsUpdated
                        ? [
                              { name: "old-embeds.json", attachment: Buffer.from(JSON.stringify(instance.embeds, null, 4)) },
                              { name: "new-embeds.json", attachment: Buffer.from(JSON.stringify(embedsAfter, null, 4)) },
                          ]
                        : []),
                ],
            },
            instance.author,
        );

    if (process.env.VERBOSE) console.log("[GLOBAL] Triggering edit.");

    await globalChatRelayQueue.add("", {
        type: "start-edit",
        ref: instance.id,
        guild: after.guild!.id,
        channel: after.channel.id,
        message: after.id,
        content: contentUpdated ? after.content || "" : undefined,
        embeds: embedsUpdated ? embedsAfter : undefined,
        attachments: attachmentsUpdated
            ? [
                  ...(await Promise.all(
                      after.attachments.map(async (attachment) => ({
                          name: attachment.name,
                          attachment: await addFile(attachment.url, `Triggered by edit of ${after.url} sent by ${after.author} in ${after.guild!.name}`),
                          sticker: false,
                      })),
                  )),
                  ...((instance.attachments as any[]) ?? []).filter((attachment) => attachment.sticker),
              ]
            : undefined,
    });
});

makeWorker<GlobalChatRelayTask>("global-chat-relay", async (data) => {
    if (data.type === "post") {
        const message = await db.query.globalMessages.findFirst({ where: eq(tables.globalMessages.id, data.id) });

        if (!message) return;
        if (message.deleted) return;

        const webhooks: Webhook[] = [];

        await trackMetrics("global:relay:get-webhooks", async () => {
            for (const { guild: guildId, location } of data.locations) {
                const guild = await globalBot.guilds.fetch(guildId).catch(() => null);
                if (!guild) continue;

                const channel = await guild.channels.fetch(location).catch(() => null);
                if (channel?.type !== ChannelType.GuildText) continue;

                if (
                    !channel
                        .permissionsFor(globalBot.user!)
                        ?.has(PermissionFlagsBits.ReadMessageHistory | PermissionFlagsBits.ManageWebhooks | PermissionFlagsBits.ManageMessages)
                )
                    continue;

                const webhook = await getWebhook(channel);
                if (!webhook) continue;

                webhooks.push(webhook);
            }
        });

        if (webhooks.length === 0) return;

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

        const posts: Message[] = [];
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
                            instances.map((instance) => [
                                instance.guild,
                                `https://discord.com/channels/${instance.guild}/${instance.channel}/${instance.message}`,
                            ]),
                        ),
                    );
                } catch {}
        });

        await trackMetrics("global:relay:send", async () => {
            await Promise.all(
                webhooks.map(async (webhook) => {
                    try {
                        const content = message.content.replaceAll(/https:\/\/(\w+\.)?discord\.com\/channels\/\d+\/\d+\/\d+/g, (match) => {
                            const id = match.split("/").at(-1)!;
                            return messageInstances.get(id)?.get(webhook.guildId) ?? match;
                        });

                        posts.push(
                            await webhook.send({
                                username: message.username,
                                avatarURL: message.avatar,
                                content:
                                    (message.replyTo === null
                                        ? ""
                                        : prefixes.get(webhook.guildId) ?? `${process.env.EMOJI_GLOBAL_REPLY} **[original not found]**\n`) + content,
                                embeds: message.embeds as any,
                                files: message.attachments as any,
                            }),
                        );
                    } catch {}
                }),
            );
        });

        await trackMetrics("global:relay:insert-instances", async () => {
            await db
                .insert(tables.globalMessageInstances)
                .values(posts.map((post) => ({ ref: message.id, guild: post.guild!.id, channel: post.channel.id, message: post.id })));
        });
    } else if (data.type === "start-delete") {
        const instances = await db.query.globalMessageInstances.findMany({
            where: inArray(
                tables.globalMessageInstances.ref,
                data.objects.map((object) => object.ref),
            ),
        });

        const instanceMap: Record<string, { ref: number; guild: string; message: string }[]> = {};

        for (const { channel, ...instance } of instances) (instanceMap[channel] ??= []).push(instance);

        const batched = new Set(data.objects.map((object) => object.message));

        const ids = new Set(data.objects.map((object) => object.ref));

        const jobs = await globalChatRelayQueue.getJobs();

        for (const job of jobs)
            if (job.data.type === "post" && ids.has(job.data.id)) await job.remove();
            else if (job.data.type === "start-edit" && ids.has(job.data.ref)) await job.remove();
            else if (job.data.type === "edit" && ids.has(job.data.ref)) await job.remove();
            else if (job.data.type === "delete" && job.data.channel in instanceMap) {
                const messages = instanceMap[job.data.channel].map((instance) => instance.message);
                await job.updateData({ ...job.data, messages: [...job.data.messages, ...messages] });
                for (const message of messages) batched.add(message);
            }

        await globalChatRelayQueue.addBulk(
            Object.entries(instanceMap)
                .map(([channel, instances]) => [channel, instances.filter((instance) => !batched.has(instance.message))] as const)
                .filter(([, instances]) => instances.length > 0)
                .map(([channel, instances]) => ({
                    name: "",
                    data: { type: "delete", guild: instances[0].guild, channel, messages: instances.map((instance) => instance.message) },
                    opts: { priority: GlobalChatTaskPriority.Delete },
                })),
        );
    } else if (data.type === "delete") {
        const guild = await globalBot.guilds.fetch(data.guild).catch(() => null);
        if (!guild) return;

        const channel = await guild.channels.fetch(data.channel).catch(() => null);
        if (channel?.type !== ChannelType.GuildText) return;

        if (data.messages.length === 1) await channel.messages.delete(data.messages[0]).catch(() => null);
        else for (let i = 0; i < data.messages.length; i += 100) await channel.bulkDelete(data.messages.slice(i, i + 100)).catch(() => null);
    } else if (data.type === "start-edit") {
        await db
            .update(tables.globalMessages)
            .set({ content: data.content, embeds: data.embeds, attachments: data.attachments })
            .where(eq(tables.globalMessages.id, data.ref));

        const instances = await db.query.globalMessageInstances.findMany({ where: eq(tables.globalMessageInstances.ref, data.ref) });

        await globalChatRelayQueue.addBulk(
            instances.map((instance) => ({
                name: "",
                data: { type: "edit", ref: instance.ref, guild: instance.guild, channel: instance.channel, message: instance.message },
                opts: { priority: GlobalChatTaskPriority.Edit },
            })),
        );
    } else if (data.type === "edit") {
        const guild = await globalBot.guilds.fetch(data.guild).catch(() => null);
        if (!guild) return;

        const channel = await guild.channels.fetch(data.channel).catch(() => null);
        if (channel?.type !== ChannelType.GuildText) return;

        const message = await channel.messages.fetch(data.message).catch(() => null);
        if (!message) return;

        const webhook = await message.fetchWebhook().catch(() => null);
        if (!webhook) return;

        const entry = await db.query.globalMessages.findFirst({
            columns: { content: true, embeds: true, attachments: true },
            where: eq(tables.globalMessages.id, data.ref),
        });

        if (!entry) return;

        await webhook.editMessage(message.id, {
            content: message.content === entry.content ? undefined : entry.content || null,
            embeds: entry.embeds as any,
            files: entry.attachments as any,
        });
    } else if (data.type === "start-info-on-user") {
        const instances = await db
            .select({
                content: tables.globalMessages.content,
                guild: tables.globalMessageInstances.guild,
                channel: tables.globalMessageInstances.channel,
                message: tables.globalMessageInstances.message,
            })
            .from(tables.globalMessageInstances)
            .innerJoin(tables.globalMessages, eq(tables.globalMessageInstances.ref, tables.globalMessages.id))
            .where(eq(tables.globalMessages.id, data.ref));

        const messages = await Promise.all(
            instances.map(async (instance) => {
                try {
                    const guild = await globalBot.guilds.fetch(instance.guild);
                    const channel = await guild.channels.fetch(instance.channel);
                    if (channel?.type !== ChannelType.GuildText) return [];

                    const message = await channel.messages.fetch(instance.message);
                    return await message.reply({ ...infoOnUserRequestMessage([]), flags: MessageFlags.SuppressNotifications });
                } catch {}

                return [];
            }),
        );

        await db
            .insert(tables.globalInfoOnUserRequestInstances)
            .values(messages.flat().map((message) => ({ ref: data.ref, guild: message.guild!.id, channel: message.channel.id, message: message.id })));
    }
});

globalBot.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton() && interaction.customId === "info-on-user-declare-none") {
        await interaction.deferUpdate();

        const data = await db.query.globalInfoOnUserRequestInstances.findFirst({
            where: eq(tables.globalInfoOnUserRequestInstances.message, interaction.message.id),
        });

        if (!data) return;

        const entry = await db.query.guilds.findFirst({ where: eq(tables.guilds.id, interaction.guild!.id) });

        try {
            await db
                .insert(tables.globalInfoRequestGuilds)
                .values({ ref: data.ref, guild: data.guild, name: escapeMarkdown(entry?.name ?? interaction.guild!.name) });
        } catch {
            return;
        }

        const entries = await db.query.globalInfoRequestGuilds.findMany({ columns: { name: true }, where: eq(tables.globalInfoRequestGuilds.ref, data.ref) });
        const names = entries.map((entry) => entry.name);

        const instances = await db.query.globalInfoOnUserRequestInstances.findMany({ where: eq(tables.globalInfoOnUserRequestInstances.ref, data.ref) });

        await Promise.all(
            instances.map(async (instance) => {
                try {
                    const guild = await globalBot.guilds.fetch(instance.guild);
                    const channel = await guild.channels.fetch(instance.channel).catch(() => null);
                    if (channel?.type !== ChannelType.GuildText) return;

                    const message = await channel.messages.fetch(instance.message);
                    await message.edit(infoOnUserRequestMessage(names));
                } catch {}
            }),
        );
    }
});

globalBot.on(Events.WebhooksUpdate, async (channel) => {
    if (!globalWebhookMap.has(channel.id)) return;

    if (globalWebhookMap.get(channel.id)!.applicationId) globalWebhookMap.delete(channel.id);
    else
        await trackMetrics("global:purge-webhook", async () => {
            const webhooks = await channel.fetchWebhooks();
            if (webhooks.has(globalWebhookMap.get(channel.id)!.id)) globalWebhookMap.delete(channel.id);
        });
});

function infoOnUserRequestMessage(guilds: string[]): BaseMessageOptions {
    return {
        embeds: [{ title: "Info-On-User Request", description: `Reported no info: ${guilds.length === 0 ? "(none)" : englishList(guilds)}`, color: 0x2b2d31 }],
        components: [
            {
                type: ComponentType.ActionRow,
                components: [
                    {
                        type: ComponentType.Button,
                        customId: "info-on-user-declare-none",
                        style: ButtonStyle.Secondary,
                        label: `No Info Here (${guilds.length})`,
                    },
                ],
            },
        ],
    };
}
