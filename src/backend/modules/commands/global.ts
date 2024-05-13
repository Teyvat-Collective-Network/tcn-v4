import {
    ApplicationCommandDataResolvable,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    AutocompleteInteraction,
    ChannelType,
    ChatInputCommandInteraction,
} from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { fuzzy } from "../../lib.js";
import { isObserver } from "../../lib/api-lib.js";
import { cmdKey, ensureObserver } from "../../lib/bot-lib.js";

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
                        description: "the URL of the message",
                        required: true,
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
                type: ApplicationCommandOptionType.SubcommandGroup,
                name: "purge",
                description: "purge messages",
                options: [
                    {
                        type: ApplicationCommandOptionType.Subcommand,
                        name: "last",
                        description: "purge the last N messages",
                        options: [
                            {
                                type: ApplicationCommandOptionType.Integer,
                                name: "count",
                                description: "the number of messages to purge",
                                required: true,
                                maxValue: 1000,
                            },
                            {
                                type: ApplicationCommandOptionType.User,
                                name: "user",
                                description: "if set, only purge messages sent by this user",
                            },
                        ],
                    },
                    {
                        type: ApplicationCommandOptionType.Subcommand,
                        name: "between",
                        description: "purge messages between two messages",
                        options: [
                            {
                                type: ApplicationCommandOptionType.String,
                                name: "first",
                                description: "the URL of the first message to purge",
                                required: true,
                            },
                            {
                                type: ApplicationCommandOptionType.String,
                                name: "last",
                                description: "the URL of the last message to purge",
                                required: true,
                            },
                            {
                                type: ApplicationCommandOptionType.User,
                                name: "user",
                                description: "if set, only purge messages sent by this user",
                            },
                        ],
                    },
                    {
                        type: ApplicationCommandOptionType.Subcommand,
                        name: "since",
                        description: "purge messages since a certain amount of time ago",
                        options: [
                            {
                                type: ApplicationCommandOptionType.String,
                                name: "how-long-ago",
                                description: "how along ago to start (e.g. 10m, 2h)",
                                required: true,
                            },
                            {
                                type: ApplicationCommandOptionType.User,
                                name: "user",
                                description: "if set, only purge messages sent by this user",
                            },
                        ],
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
                type: ApplicationCommandOptionType.SubcommandGroup,
                name: "connection",
                description: "manage this connection",
                options: [
                    {
                        type: ApplicationCommandOptionType.Subcommand,
                        name: "suspend",
                        description: "suspend this connection",
                    },
                    {
                        type: ApplicationCommandOptionType.Subcommand,
                        name: "unsuspend",
                        description: "resume this connection",
                    },
                    {
                        type: ApplicationCommandOptionType.Subcommand,
                        name: "move",
                        description: "move this connection to a different channel",
                        options: [
                            {
                                type: ApplicationCommandOptionType.Channel,
                                name: "channel",
                                description: "the channel to move to",
                                required: true,
                                channelTypes: [ChannelType.GuildText],
                            },
                        ],
                    },
                ],
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
        ],
    },
    {
        type: ApplicationCommandType.Message,
        name: "Get Author",
    },
    {
        type: ApplicationCommandType.Message,
        name: "Ban Author",
    },
    {
        type: ApplicationCommandType.Message,
        name: "Ban Author Silently",
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
    await interaction.deferReply({ ephemeral: true });

    const key = cmdKey(interaction);
}
