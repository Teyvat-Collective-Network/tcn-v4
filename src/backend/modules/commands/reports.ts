import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, ApplicationCommandType, ChannelType, ChatInputCommandInteraction } from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { cmdKey, ensureTCN, template } from "../../lib/bot-lib.js";
import { DurationStyle, formatDuration, parseDuration } from "../../lib/time.js";

export default {
    type: ApplicationCommandType.ChatInput,
    name: "reports",
    description: "manage network user report settings",
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "set-channel",
            description: "set the network user reports output channel",
            options: [
                {
                    type: ApplicationCommandOptionType.Channel,
                    name: "channel",
                    description: "the new reports channel (leave empty to remove)",
                    channelTypes: [ChannelType.GuildText],
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "set-logs",
            description: "set the network user reports logging channel",
            options: [
                {
                    type: ApplicationCommandOptionType.Channel,
                    name: "channel",
                    description: "the new reports logging channel (if empty, logs are sent to your reports channel itself)",
                    channelTypes: [ChannelType.GuildText],
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "autoban",
            description: "control whether to automatically execute banshares",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "action",
                    description: "the action to take",
                    required: true,
                    choices: [
                        { name: "Enable", value: "enable" },
                        { name: "Disable", value: "disable" },
                        { name: "Check", value: "check" },
                    ],
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "autokick",
            description: "control whether to automatically kick reported hacked accounts",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "action",
                    description: "the action to take",
                    required: true,
                    choices: [
                        { name: "Enable", value: "enable" },
                        { name: "Disable", value: "disable" },
                        { name: "Check", value: "check" },
                    ],
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "autoban-threshold",
            description: "set the minimum member age for exemption from autobans",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "threshold",
                    description: "threshold (e.g. 4d, 1w) (leave blank to check) (set to 0 to disable exemption)",
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "categories",
            description: "control which categories to receive",
            options: [
                {
                    type: ApplicationCommandOptionType.Integer,
                    name: "configuration",
                    description: "the configuration to enable (leave blank to check)",
                    choices: [
                        { name: "Enable All (Banshares, Advisory Reports, Hacked Account Reports)", value: 7 },
                        { name: "Banshares + Advisory Reports", value: 6 },
                        { name: "Banshares + Hacked Account Reports", value: 5 },
                        { name: "Advisory Reports + Hacked Account Reports", value: 3 },
                        { name: "Banshares Only", value: 4 },
                        { name: "Advisory Reports Only", value: 2 },
                        { name: "Hacked Account Reports Only", value: 1 },
                        { name: "Disable All", value: 0 },
                    ],
                },
            ],
        },
    ],
} satisfies ApplicationCommandDataResolvable;

export async function handleReports(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    await ensureTCN(interaction);
    if (!interaction.guild) return;

    if (interaction.user.id !== interaction.guild.ownerId) throw "Only the server owner can manage network user report settings.";

    const key = cmdKey(interaction);

    if (key === "set-channel") {
        const channel = interaction.options.getChannel("channel", false);

        if (!channel) {
            await db.update(tables.reportSettings).set({ channel: null }).where(eq(tables.reportSettings.guild, interaction.guild.id));
            await interaction.editReply(template.ok("Network user reports will no longer be sent to this server."));
        } else {
            await db
                .insert(tables.reportSettings)
                .values({ guild: interaction.guild.id, channel: channel.id })
                .onDuplicateKeyUpdate({ set: { channel: channel.id } });

            await interaction.editReply(template.ok(`Network user reports will now be sent to ${channel}.`));
        }
    } else if (key === "set-logs") {
        const channel = interaction.options.getChannel("channel", false);

        if (!channel) {
            await db.update(tables.reportSettings).set({ logs: null }).where(eq(tables.reportSettings.guild, interaction.guild.id));
            await interaction.editReply(template.ok("Network user report logs will now always appear in the reports channel."));
        } else {
            await db
                .insert(tables.reportSettings)
                .values({ guild: interaction.guild.id, logs: channel.id })
                .onDuplicateKeyUpdate({ set: { logs: channel.id } });

            await interaction.editReply(template.ok(`Network user report logs will now be sent to ${channel}.`));
        }
    } else if (key === "autoban") {
        const action = interaction.options.getString("action", true);

        if (action === "check") {
            const settings = await db.query.reportSettings.findFirst({
                columns: { autoban: true },
                where: eq(tables.reportSettings.guild, interaction.guild.id),
            });

            if (!settings) throw "Network user reports have not been set up in this server.";

            await interaction.editReply(template.info(`Autobans are currently ${settings.autoban ? "enabled" : "disabled"}.`));
        } else {
            await db
                .insert(tables.reportSettings)
                .values({ guild: interaction.guild.id, autoban: action === "enable" })
                .onDuplicateKeyUpdate({ set: { autoban: action === "enable" } });

            await interaction.editReply(template.ok(`Autobans are now ${action === "enable" ? "enabled" : "disabled"}.`));
        }
    } else if (key === "autokick") {
        const action = interaction.options.getString("action", true);

        if (action === "check") {
            const settings = await db.query.reportSettings.findFirst({
                columns: { autokick: true },
                where: eq(tables.reportSettings.guild, interaction.guild.id),
            });

            if (!settings) throw "Network user reports have not been set up in this server.";

            await interaction.editReply(template.info(`Autokicks are currently ${settings.autokick ? "enabled" : "disabled"}.`));
        } else {
            await db
                .insert(tables.reportSettings)
                .values({ guild: interaction.guild.id, autokick: action === "enable" })
                .onDuplicateKeyUpdate({ set: { autokick: action === "enable" } });

            await interaction.editReply(template.ok(`Autokicks are now ${action === "enable" ? "enabled" : "disabled"}.`));
        }
    } else if (key === "autoban-threshold") {
        const threshold = interaction.options.getString("threshold", false);

        if (threshold === null) {
            const settings = await db.query.reportSettings.findFirst({
                columns: { autobanMemberThreshold: true },
                where: eq(tables.reportSettings.guild, interaction.guild.id),
            });

            if (!settings) throw "Network user reports have not been set up in this server.";
            if (settings.autobanMemberThreshold === 0) return void interaction.editReply(template.info("Autoban exemptions for members are disabled."));

            await interaction.editReply(
                template.info(`The minimum member age for exemption from autobans is ${formatDuration(settings.autobanMemberThreshold, DurationStyle.Blank)}.`),
            );
        } else {
            const duration = parseDuration(threshold);

            await db
                .insert(tables.reportSettings)
                .values({ guild: interaction.guild.id, autobanMemberThreshold: duration })
                .onDuplicateKeyUpdate({ set: { autobanMemberThreshold: duration } });

            await interaction.editReply(
                template.ok(`The minimum member age for exemption from autobans is now ${formatDuration(duration, DurationStyle.Blank)}.`),
            );
        }
    } else if (key === "categories") {
        const configuration = interaction.options.getInteger("configuration", false);

        if (configuration === null) {
            const settings = await db.query.reportSettings.findFirst({
                columns: { receiveBanshare: true, receiveAdvisory: true, receiveHacked: true },
                where: eq(tables.reportSettings.guild, interaction.guild.id),
            });

            if (!settings) throw "Network user reports have not been set up in this server.";

            await interaction.editReply(
                template.info(
                    `The server is currently receiving ${
                        settings.receiveBanshare
                            ? settings.receiveAdvisory
                                ? settings.receiveHacked
                                    ? "all categories (banshares, advisory reports, and hacked user reports)"
                                    : "banshares and advisory reports"
                                : settings.receiveHacked
                                ? "banshares and hacked user reports"
                                : "only banshares"
                            : settings.receiveAdvisory
                            ? settings.receiveHacked
                                ? "advisory reports and hacked user reports"
                                : "only advisory reports"
                            : settings.receiveHacked
                            ? "only hacked user reports"
                            : "no categories of reports"
                    }.`,
                ),
            );
        } else {
            const set = {
                receiveBanshare: (configuration & 4) !== 0,
                receiveAdvisory: (configuration & 2) !== 0,
                receiveHacked: (configuration & 1) !== 0,
            } as const;

            await db
                .insert(tables.reportSettings)
                .values({ guild: interaction.guild.id, ...set })
                .onDuplicateKeyUpdate({ set });

            await interaction.editReply(template.ok("Network user report categories have been updated."));
        }
    }
}
