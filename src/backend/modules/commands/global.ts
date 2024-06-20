import {
    ApplicationCommandDataResolvable,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    AutocompleteInteraction,
    ChannelType,
    ChatInputCommandInteraction,
    MessageContextMenuCommandInteraction,
    MessageFlags,
    PermissionFlagsBits,
    escapeMarkdown,
} from "discord.js";
import { and, eq } from "drizzle-orm";
import { channels } from "../../bot.js";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import globalBot from "../../global-bot.js";
import { fuzzy } from "../../lib.js";
import { isObserver } from "../../lib/api-lib.js";
import { audit } from "../../lib/audit.js";
import { cmdKey, ensureObserver, ensureTCN, promptConfirm, template } from "../../lib/bot-lib.js";
import { logToChannel } from "../../lib/global.js";
import { fixUserRolesQueue, globalChatRelayQueue } from "../../queue.js";

export default [
    {
        type: ApplicationCommandType.ChatInput,
        name: "global",
        description: "global chat commands",
        options: [
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "author",
                description: "get the author of a message",
                options: [
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "message",
                        description: "the URL or ID of the message",
                        required: true,
                    },
                ],
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "warn",
                description: "warn a user",
                options: [
                    {
                        type: ApplicationCommandOptionType.User,
                        name: "user",
                        description: "the user to warn",
                        required: true,
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "reason",
                        description: "the reason for the warn",
                        required: true,
                        maxLength: 256,
                    },
                ],
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "ban",
                description: "ban a user from this global channel",
                options: [
                    {
                        type: ApplicationCommandOptionType.User,
                        name: "user",
                        description: "the user to ban",
                        required: true,
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "reason",
                        description: "the reason for the ban",
                        maxLength: 256,
                    },
                    {
                        type: ApplicationCommandOptionType.Boolean,
                        name: "silence",
                        description: "set to true to skip notifying the user",
                    },
                ],
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "unban",
                description: "unban a user from this global channel",
                options: [
                    {
                        type: ApplicationCommandOptionType.User,
                        name: "user",
                        description: "the user to unban",
                        required: true,
                    },
                    {
                        type: ApplicationCommandOptionType.Boolean,
                        name: "silence",
                        description: "set to true to skip notifying the user",
                    },
                ],
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "panic",
                description: "put the current global channel into panic mode, shutting down message relaying",
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "end-panic",
                description: "remove the current global channel's panic mode, restoring normal functionality",
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "nickname",
                description: "set your global chat nickname",
                options: [
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "nickname",
                        description: "the nickname to set (leave blank to reset)",
                        maxLength: 40,
                    },
                ],
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "connect",
                description: "connect to a global channel",
                options: [
                    {
                        type: ApplicationCommandOptionType.Integer,
                        name: "channel",
                        description: "the channel to connect to",
                        required: true,
                        autocomplete: true,
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "password",
                        description: "the password (if this channel requires one)",
                        maxLength: 128,
                    },
                ],
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "disconnect",
                description: "disconnect this channel from global chat",
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "help",
                description: "show the global chat help resources",
                options: [
                    {
                        type: ApplicationCommandOptionType.Boolean,
                        name: "public",
                        description: "if true, show the embed publicly",
                    },
                ],
            },
            {
                type: ApplicationCommandOptionType.SubcommandGroup,
                name: "mods",
                description: "manage a channel's mods",
                options: [
                    {
                        type: ApplicationCommandOptionType.Subcommand,
                        name: "add",
                        description: "add a user to this channel's mod team",
                        options: [
                            {
                                type: ApplicationCommandOptionType.User,
                                name: "user",
                                description: "the user to add",
                                required: true,
                            },
                        ],
                    },
                    {
                        type: ApplicationCommandOptionType.Subcommand,
                        name: "remove",
                        description: "remove a user from this channel's mod team",
                        options: [
                            {
                                type: ApplicationCommandOptionType.User,
                                name: "user",
                                description: "the user to remove",
                                required: true,
                            },
                        ],
                    },
                    {
                        type: ApplicationCommandOptionType.Subcommand,
                        name: "list",
                        description: "list this channel's mods",
                    },
                ],
            },
            {
                type: ApplicationCommandOptionType.SubcommandGroup,
                name: "logs",
                description: "set the logs of a global channel",
                options: [
                    {
                        type: ApplicationCommandOptionType.Subcommand,
                        name: "set",
                        description: "set the logs of a global channel",
                        options: [
                            {
                                type: ApplicationCommandOptionType.Integer,
                                name: "channel",
                                description: "the channel for which to set the logs",
                                required: true,
                                autocomplete: true,
                            },
                            {
                                type: ApplicationCommandOptionType.Channel,
                                name: "location",
                                description: "the channel to set the logs to",
                                required: true,
                                channelTypes: [ChannelType.GuildText],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        type: ApplicationCommandType.Message,
        name: "Get Author",
    },
] satisfies ApplicationCommandDataResolvable[];

export async function autocompleteGlobalChannel(interaction: AutocompleteInteraction) {
    const key = cmdKey(interaction);
    const query = interaction.options.getFocused();

    const observer = await isObserver(interaction.user.id);

    if (key !== "connect" && !observer) return;

    const channels = await db.query.globalChannels.findMany({
        columns: { id: true, name: true },
        where: observer ? undefined : eq(tables.globalChannels.visible, true),
    });

    await interaction.respond(
        channels
            .filter((channel) => fuzzy(channel.name, query))
            .slice(0, 25)
            .map((channel) => ({ name: channel.name, value: channel.id })),
    );
}

export async function handleGlobal(interaction: ChatInputCommandInteraction) {
    const key = cmdKey(interaction);

    if (key === "help")
        return void interaction.reply({
            embeds: [
                {
                    title: "Global Chat Help",
                    color: 0x2b2d31,
                    fields: [
                        {
                            name: "What is Global Chat?",
                            value: "Global chat allows users in different servers to talk with each other. Messages sent in connected channels will appear in other connected channels using webhooks.",
                        },
                        {
                            name: "Why is everyone a bot?",
                            value: "Messages are relayed uusing webhooks, a Discord feature that allows the message to appear using the user's name and avatar, making it look like they sent the message directly in the destination channel. Discord indicates webhook messages with a BOT tag behind the username.",
                        },
                        {
                            name: "Global Chat Rules",
                            value: `${process.env.DOMAIN}/docs/global-chat-rules`,
                        },
                    ],
                },
            ],
            ephemeral: !interaction.options.getBoolean("public"),
        });

    await interaction.deferReply({ ephemeral: true });

    if (key === "logs/set") {
        await ensureObserver(interaction);

        const id = interaction.options.getInteger("channel", true);
        const channel = interaction.options.getChannel("location", true).id;

        const entry = await db.query.globalChannels.findFirst({ where: eq(tables.globalChannels.id, id) });
        if (!entry) throw "That channel does not exist.";

        await db.update(tables.globalChannels).set({ logs: channel }).where(eq(tables.globalChannels.id, id));

        await interaction.editReply(template.ok(`Log channel for **${escapeMarkdown(entry.name)}** set to <#${channel}>.`));
    } else if (key === "connect") {
        const observer = await isObserver(interaction.user.id);

        if (!observer && interaction.user.id !== interaction.guild!.ownerId) throw "Only the server owner may connect global channels.";
        if (!observer) await ensureTCN(interaction);

        if (interaction.channel?.type !== ChannelType.GuildText) throw "This command may only be used in guild text channels.";

        const id = interaction.options.getInteger("channel", true);
        const password = interaction.options.getString("password");

        const channel = await db.query.globalChannels.findFirst({ where: eq(tables.globalChannels.id, id) });

        if (!channel) throw "That channel does not exist.";
        if (!channel.visible && !observer) throw "This is a private channel, so only observers may connect to it.";
        if (channel.password !== null && channel.password !== password) throw "Incorrect password.";

        await db
            .insert(tables.globalConnections)
            .values({ channel: channel.id, guild: interaction.guild!.id, location: interaction.channel!.id })
            .onDuplicateKeyUpdate({ set: { location: interaction.channel!.id } });

        await interaction.editReply(template.ok(`Connected to **${escapeMarkdown(channel.name)}**.`));

        if (channel.logs)
            await logToChannel(
                channel.logs,
                `**[connect]** ${interaction.user} connected ${interaction.channel} in **${escapeMarkdown(interaction.guild!.name)}** to **${escapeMarkdown(
                    channel.name,
                )}**.`,
                interaction.user.id,
            );

        await audit(
            interaction.user.id,
            "global/connect",
            interaction.guild!.id,
            { channel: channel.id, location: interaction.channel!.id, name: channel.name },
            [interaction.channel!.id],
        );
    } else if (key === "disconnect") {
        const observer = await isObserver(interaction.user.id);
        if (!observer && interaction.user.id !== interaction.guild!.ownerId) throw "Only the server owner may disconnect global channels.";

        const [data] = await db
            .select({ id: tables.globalChannels.id, name: tables.globalChannels.name, logs: tables.globalChannels.logs })
            .from(tables.globalConnections)
            .innerJoin(tables.globalChannels, eq(tables.globalConnections.channel, tables.globalChannels.id))
            .where(eq(tables.globalConnections.location, interaction.channel!.id));

        if (!data) throw "This channel is not connected to a global channel.";

        await db.delete(tables.globalConnections).where(eq(tables.globalConnections.location, interaction.channel!.id));

        await interaction.editReply(template.ok(`Disconnected from the global channel **${escapeMarkdown(data.name)}**.`));

        if (data.logs)
            await logToChannel(
                data.logs,
                `**[disconnect]** ${interaction.user} disconnected ${interaction.channel} in **${escapeMarkdown(
                    interaction.guild!.name,
                )}** from **${escapeMarkdown(data.name)}**.`,
                interaction.user.id,
            );

        await audit(interaction.user.id, "global/disconnect", interaction.guild!.id, { channel: data.id, name: data.name }, [interaction.channel!.id]);
    } else if (key === "author") {
        const id = interaction.options.getString("message", true).match(/\b[1-9][0-9]{16,19}$/)?.[0];
        if (!id) throw "Invalid message URL or ID.";

        const text = await getAuthor(id);
        await interaction.editReply(template.info(text));
    } else if (key === "warn" || key === "ban" || key === "unban") {
        const observer = await isObserver(interaction.user.id);
        let globalMod = observer;

        const [channel] = await db
            .select({ id: tables.globalChannels.id, name: tables.globalChannels.name })
            .from(tables.globalConnections)
            .innerJoin(tables.globalChannels, eq(tables.globalConnections.channel, tables.globalChannels.id))
            .where(eq(tables.globalConnections.location, interaction.channel!.id));

        if (!channel) throw "This channel is not connected to a global channel.";

        globalMod ||= !!(await db.query.globalMods.findFirst({
            where: and(eq(tables.globalMods.channel, channel.id), eq(tables.globalMods.user, interaction.user.id)),
        }));

        if (!globalMod) {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers))
                throw "You do not have permission to do that (required: observer, global chat mod, or Ban Members).";
        }

        const user = interaction.options.getUser("user", true);

        if (
            key === "ban" &&
            !!(await db.query.globalBans.findFirst({ where: and(eq(tables.globalBans.channel, channel.id), eq(tables.globalBans.user, user.id)) }))
        )
            throw "That user is already banned from this channel.";

        if (
            key === "unban" &&
            !(await db.query.globalBans.findFirst({ where: and(eq(tables.globalBans.channel, channel.id), eq(tables.globalBans.user, user.id)) }))
        )
            throw "That user is not banned from this channel.";

        const reason = interaction.options.getString("reason");
        const silence = interaction.options.getBoolean("silence") ?? false;

        const Key = key[0].toUpperCase() + key.slice(1);
        const keyed = key === "warn" ? "warned" : key === "ban" ? "banned" : "unbanned";
        const Keyed = keyed[0].toUpperCase() + keyed.slice(1);

        const res = await promptConfirm(interaction, `${Key} ${user}?`);
        await res.deferUpdate();

        if (!silence)
            await user
                .send({
                    embeds: [
                        {
                            title: `Global Chat ${Key}`,
                            description: `You have been ${keyed} by ${
                                observer
                                    ? "a TCN observer (admin)"
                                    : globalMod
                                    ? "a global chat moderator"
                                    : "a network moderator who is not a member of the global chat moderation team"
                            }. ${
                                key === "unban"
                                    ? ""
                                    : `If you believe this action is not justified, please feel free to reach out to us (see our [contact page](${process.env.DOMAIN}/contact)).`
                            }`,
                            color: 0x2b2d31,
                            fields: reason ? [{ name: "Reason", value: reason }] : [],
                        },
                    ],
                })
                .catch(() => {
                    res.editReply(
                        template.error("That user could not be contacted. They may have DMs off or have blocked the bot. This action has been canceled."),
                    );
                    throw null;
                });

        await db.insert(tables.globalModLogs).values({ user: user.id, actor: interaction.user.id, action: key, reason });

        if (key === "ban")
            await db
                .insert(tables.globalBans)
                .values({ channel: channel.id, user: user.id })
                .catch(() => {
                    throw "Could not ban this user; they may have already been banned just now.";
                });
        else if (key === "unban") await db.delete(tables.globalBans).where(and(eq(tables.globalBans.channel, channel.id), eq(tables.globalBans.user, user.id)));

        await res.editReply(template.ok(`${Keyed} ${user}.`));

        await channels.globalModLogs.send({
            embeds: [
                {
                    title: `${Key} Issued`,
                    description: `${interaction.user} ${keyed} ${user} in global channel #${channel.id} (**${escapeMarkdown(channel.name)}**).`,
                    color: 0x2b2d31,
                    fields: reason ? [{ name: "Reason", value: reason }] : [],
                    footer: silence ? { text: "The user was not notified of this action." } : undefined,
                },
            ],
        });
    } else if (key === "panic") {
        const observer = await isObserver(interaction.user.id);
        let globalMod = observer;

        const [channel] = await db
            .select({ id: tables.globalChannels.id, name: tables.globalChannels.name, panic: tables.globalChannels.panic })
            .from(tables.globalConnections)
            .innerJoin(tables.globalChannels, eq(tables.globalConnections.channel, tables.globalChannels.id))
            .where(eq(tables.globalConnections.location, interaction.channel!.id));

        if (!channel) throw "This channel is not connected to a global channel.";
        if (channel.panic) throw "This channel is already in panic mode.";

        globalMod ||= !!(await db.query.globalMods.findFirst({
            where: and(eq(tables.globalMods.channel, channel.id), eq(tables.globalMods.user, interaction.user.id)),
        }));

        if (!globalMod) {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers))
                throw "You do not have permission to do that (required: observer, global chat mod, or Ban Members).";
        }

        const res = await promptConfirm(interaction, "Put this channel into panic mode?");
        await res.deferUpdate();

        await db.update(tables.globalChannels).set({ panic: true }).where(eq(tables.globalChannels.id, channel.id));

        await channels.observerManagement.send({
            content: `<@&${process.env.ROLE_OBSERVERS}> Global channel #${channel.id} (**${escapeMarkdown(channel.name)}**) has been put into panic mode by ${
                interaction.user
            }.`,
            allowedMentions: { roles: [process.env.ROLE_OBSERVERS!] },
        });

        for (const job of await globalChatRelayQueue.getJobs()) if (["post", "edit", "edit"].includes(job.data.type)) await job.remove();

        await res.editReply(template.ok("This channel is now in panic mode. Observers have been alerted. You may continue deleting messages."));

        await audit(interaction.user.id, "global/panic", interaction.guild!.id, { channel: channel.id, name: channel.name });

        const connections = await db.query.globalConnections.findMany({ columns: { location: true }, where: eq(tables.globalConnections.channel, channel.id) });

        for (const connection of connections)
            (async () => {
                const channel = await globalBot.channels.fetch(connection.location).catch(() => null);
                if (channel?.type !== ChannelType.GuildText) return;

                await channel.send({
                    content: "This global channel has been put into panic mode. Observers have been alerted.",
                    flags: MessageFlags.SuppressNotifications,
                });
            })().catch(() => null);
    } else if (key === "end-panic") {
        await ensureObserver(interaction);

        const [channel] = await db
            .select({ id: tables.globalChannels.id, name: tables.globalChannels.name, panic: tables.globalChannels.panic })
            .from(tables.globalConnections)
            .innerJoin(tables.globalChannels, eq(tables.globalConnections.channel, tables.globalChannels.id))
            .where(eq(tables.globalConnections.location, interaction.channel!.id));

        if (!channel) throw "This channel is not connected to a global channel.";
        if (!channel.panic) throw "This channel is not in panic mode.";

        await db.update(tables.globalChannels).set({ panic: false }).where(eq(tables.globalChannels.id, channel.id));

        await interaction.editReply(template.ok("This channel is no longer in panic mode."));

        await audit(interaction.user.id, "global/end-panic", interaction.guild!.id, { channel: channel.id, name: channel.name });

        const connections = await db.query.globalConnections.findMany({ columns: { location: true }, where: eq(tables.globalConnections.channel, channel.id) });

        for (const connection of connections)
            (async () => {
                const channel = await globalBot.channels.fetch(connection.location).catch(() => null);
                if (channel?.type !== ChannelType.GuildText) return;

                await channel.send({
                    content: "This global channel is no longer in panic mode. Normal functionality is resumed.",
                    flags: MessageFlags.SuppressNotifications,
                });
            })().catch(() => null);
    } else if (key === "nickname") {
        const nickname = interaction.options.getString("nickname");

        await db
            .insert(tables.users)
            .values({ id: interaction.user.id, globalNickname: nickname })
            .onDuplicateKeyUpdate({ set: { globalNickname: nickname } });

        await interaction.editReply(template.ok(`Your global chat nickname has been ${nickname ? `set to **${escapeMarkdown(nickname)}**` : "reset"}.`));
    } else if (key === "mods/add") {
        await ensureObserver(interaction);

        const user = interaction.options.getUser("user", true).id;

        const [channel] = await db
            .select({ id: tables.globalChannels.id, name: tables.globalChannels.name })
            .from(tables.globalConnections)
            .innerJoin(tables.globalChannels, eq(tables.globalConnections.channel, tables.globalChannels.id))
            .where(eq(tables.globalConnections.location, interaction.channel!.id));

        if (!channel) throw "This channel is not connected to a global channel.";

        if (!!(await db.query.globalMods.findFirst({ where: and(eq(tables.globalMods.channel, channel.id), eq(tables.globalMods.user, user)) })))
            throw "That user is already a moderator for this channel.";

        const res = await promptConfirm(interaction, `Add <@${user}> to the global chat moderation team for **${escapeMarkdown(channel.name)}**?`);
        await res.deferUpdate();

        await db
            .insert(tables.globalMods)
            .values({ channel: channel.id, user })
            .catch(() => {
                res.editReply(template.error("Error adding that user. They may have just been added by someone else."));
                throw null;
            });

        await res.editReply(template.ok(`<@${user}> has been added to the global chat moderation team for **${escapeMarkdown(channel.name)}**.`));

        await audit(interaction.user.id, "global/mods/add", null, { channel: channel.id, name: channel.name, user });

        await fixUserRolesQueue.add("", user);
    } else if (key === "mods/remove") {
        await ensureObserver(interaction);

        const user = interaction.options.getUser("user", true).id;

        const [channel] = await db
            .select({ id: tables.globalChannels.id, name: tables.globalChannels.name })
            .from(tables.globalConnections)
            .innerJoin(tables.globalChannels, eq(tables.globalConnections.channel, tables.globalChannels.id))
            .where(eq(tables.globalConnections.location, interaction.channel!.id));

        if (!channel) throw "This channel is not connected to a global channel.";

        if (!(await db.query.globalMods.findFirst({ where: and(eq(tables.globalMods.channel, channel.id), eq(tables.globalMods.user, user)) })))
            throw "That user is not a moderator for this channel.";

        const res = await promptConfirm(interaction, `Remove <@${user}> from the global chat moderation team for **${escapeMarkdown(channel.name)}**?`);
        await res.deferUpdate();

        await db.delete(tables.globalMods).where(and(eq(tables.globalMods.channel, channel.id), eq(tables.globalMods.user, user)));

        await res.editReply(template.ok(`<@${user}> has been removed from the global chat moderation team for **${escapeMarkdown(channel.name)}**.`));

        await audit(interaction.user.id, "global/mods/remove", null, { channel: channel.id, name: channel.name, user });

        await fixUserRolesQueue.add("", user);
    } else if (key === "mods/list") {
        await ensureObserver(interaction);

        const [channel] = await db
            .select({ id: tables.globalChannels.id, name: tables.globalChannels.name })
            .from(tables.globalConnections)
            .innerJoin(tables.globalChannels, eq(tables.globalConnections.channel, tables.globalChannels.id))
            .where(eq(tables.globalConnections.location, interaction.channel!.id));

        if (!channel) throw "This channel is not connected to a global channel.";

        const mods = await db.select({ user: tables.globalMods.user }).from(tables.globalMods).where(eq(tables.globalMods.channel, channel.id));

        await interaction.editReply(
            template.info(
                mods.length === 0
                    ? `**${escapeMarkdown(channel.name)}** has no moderators.`
                    : `Global chat moderators for **${escapeMarkdown(channel.name)}**:\n${mods.map((mod) => `- <@${mod.user}>`).join("\n")}`,
            ),
        );
    }
}

export async function getAuthor(id: string) {
    const [data] = await db
        .select({ author: tables.globalMessages.author })
        .from(tables.globalMessageInstances)
        .innerJoin(tables.globalMessages, eq(tables.globalMessageInstances.ref, tables.globalMessages.id))
        .where(eq(tables.globalMessageInstances.message, id));

    let author = data?.author;

    if (!data) {
        const aux = await db.query.auxGlobalAuthors.findFirst({ columns: { user: true }, where: eq(tables.auxGlobalAuthors.message, id) });
        if (!aux) throw "This is not a global chat message.";

        author = aux.user;
    }

    const user = await globalBot.users.fetch(author).catch(() => null);

    return user ? `This message was sent by ${user} (${user.tag}).` : `This message was sent by a user who could not be fetched with ID \`${data.author}\`.`;
}

export async function handleGlobalAuthor(interaction: MessageContextMenuCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const text = await getAuthor(interaction.targetId);
    await interaction.editReply(template.info(text));
}
