import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType, Client } from "discord.js";

export default async function (bot: Client<true>) {
    await bot.application.commands.set([
        {
            type: ApplicationCommandType.ChatInput,
            name: "banshares",
            description: "manage banshare settings",
            options: [
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "subscribe",
                    description: "set the banshare output channel",
                    options: [
                        {
                            type: ApplicationCommandOptionType.Channel,
                            name: "channel",
                            description: "the channel (default: this channel)",
                            channelTypes: [ChannelType.GuildText],
                        },
                    ],
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "unsubscribe",
                    description: "stop receiving banshares",
                },
                {
                    type: ApplicationCommandOptionType.SubcommandGroup,
                    name: "log",
                    description: "manage banshare log channels",
                    options: [
                        {
                            type: ApplicationCommandOptionType.Subcommand,
                            name: "enable",
                            description: "add a banshare log channel",
                            options: [
                                {
                                    type: ApplicationCommandOptionType.Channel,
                                    name: "channel",
                                    description: "the channel (default: this channel)",
                                    channelTypes: [ChannelType.GuildText],
                                },
                            ],
                        },
                        {
                            type: ApplicationCommandOptionType.Subcommand,
                            name: "disable",
                            description: "remove a banshare log channel",
                            options: [
                                {
                                    type: ApplicationCommandOptionType.Channel,
                                    name: "channel",
                                    description: "the channel (default: this channel)",
                                    channelTypes: [ChannelType.GuildText],
                                },
                            ],
                        },
                    ],
                },
                {
                    type: ApplicationCommandOptionType.SubcommandGroup,
                    name: "daedalus",
                    description: "enable/disable Daedalus integration",
                    options: [
                        {
                            type: ApplicationCommandOptionType.Subcommand,
                            name: "enable",
                            description: "enable Daedalus integration",
                        },
                        {
                            type: ApplicationCommandOptionType.Subcommand,
                            name: "disable",
                            description: "disable Daedalus integration",
                        },
                    ],
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "autoban",
                    description: "manage/view autoban settings",
                    options: [
                        {
                            type: ApplicationCommandOptionType.String,
                            name: "severity",
                            description: "the severity to manage/check",
                            choices: ["P0", "P1", "P2", "DM"].map((sev) => ({ name: sev, value: sev })),
                        },
                        {
                            type: ApplicationCommandOptionType.Integer,
                            name: "mode",
                            description: "the mode to use (empty to check)",
                            choices: ["never", "only ban members", "only ban non-members", "always"].map((mode, index) => ({ name: mode, value: index })),
                        },
                    ],
                },
            ],
        },
    ]);
}
