import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, ApplicationCommandType, ChannelType, ChatInputCommandInteraction } from "discord.js";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { audit } from "../../lib/audit.js";
import { severities } from "../../lib/banshares.js";
import { cmdKey, ensureObserver, ensureTCN, template } from "../../lib/bot-lib.js";

export default {
    type: ApplicationCommandType.ChatInput,
    name: "banshares",
    description: "manage banshare settings",
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "set-channel",
            description: "set the banshare output channel",
            options: [
                {
                    type: ApplicationCommandOptionType.Channel,
                    name: "channel",
                    description: "the new banshare output channel (leave empty to remove)",
                    channelTypes: [ChannelType.GuildText],
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "set-logs",
            description: "set the banshare logs channel",
            options: [
                {
                    type: ApplicationCommandOptionType.Channel,
                    name: "channel",
                    description: "the new banshare logs channel (if empty, logs are sent to your banshare channel itself)",
                    channelTypes: [ChannelType.GuildText],
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "autoban",
            description: "configure or check autoban settings",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "severity",
                    description: "the severity level to configure or check",
                    choices: [
                        { name: "P0", value: "P0" },
                        { name: "P1", value: "P1" },
                        { name: "P2", value: "P2" },
                        { name: "DM Scam", value: "DM" },
                    ],
                },
                {
                    type: ApplicationCommandOptionType.Integer,
                    name: "member-mode",
                    description: "whether to configure members or non-members",
                    choices: [
                        { name: "Non-Members", value: 0 },
                        { name: "Members", value: 1 },
                    ],
                },
                {
                    type: ApplicationCommandOptionType.Boolean,
                    name: "ban",
                    description: "whether or not to automatically ban (leave empty to check)",
                },
            ],
        },
    ],
} satisfies ApplicationCommandDataResolvable;

export async function handleBanshares(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    await ensureTCN(interaction);
    if (!interaction.guild) return;

    if (interaction.user.id !== interaction.guild.ownerId)
        await ensureObserver(interaction).catch(() => {
            throw "Only the server owner can manage banshare settings.";
        });

    const key = cmdKey(interaction);

    if (key === "set-channel") {
        const channel = interaction.options.getChannel("channel", false);

        if (!channel) {
            await db.update(tables.banshareSettings).set({ channel: null }).where(eq(tables.banshareSettings.guild, interaction.guild.id));
            await interaction.editReply(template.ok("Banshares will no longer be sent to this server."));
        } else {
            await db
                .insert(tables.banshareSettings)
                .values({ guild: interaction.guild.id, channel: channel.id })
                .onDuplicateKeyUpdate({ set: { channel: channel.id } });

            await interaction.editReply(template.ok(`Banshares will now be sent to ${channel}.`));
        }

        await audit(interaction.user.id, "banshares/set-channel", interaction.guild.id, channel?.id ?? null);
    } else if (key === "set-logs") {
        const channel = interaction.options.getChannel("channel", false);

        if (!channel) {
            await db.update(tables.banshareSettings).set({ logs: null }).where(eq(tables.banshareSettings.guild, interaction.guild.id));
            await interaction.editReply(template.ok("Banshare logs will now always appear in the banshare channel."));
        } else {
            await db
                .insert(tables.banshareSettings)
                .values({ guild: interaction.guild.id, logs: channel.id })
                .onDuplicateKeyUpdate({ set: { logs: channel.id } });

            await interaction.editReply(template.ok(`Banshare logs will now be sent to ${channel}.`));
        }

        await audit(interaction.user.id, "banshares/set-logs", interaction.guild.id, channel?.id ?? null);
    } else if (key === "autoban") {
        const severity = interaction.options.getString("severity", false);
        const memberMode = interaction.options.getInteger("member-mode", false);
        const ban = interaction.options.getBoolean("ban", false);

        if (ban === null) {
            if (severity === null || memberMode === null) {
                const settings = await db.query.banshareActionSettings.findMany({
                    columns: { severity: true, member: true, ban: true },
                    where:
                        severity === null
                            ? memberMode === null
                                ? eq(tables.banshareActionSettings.guild, interaction.guild.id)
                                : and(eq(tables.banshareActionSettings.guild, interaction.guild.id), eq(tables.banshareActionSettings.member, memberMode === 1))
                            : and(eq(tables.banshareActionSettings.guild, interaction.guild.id), eq(tables.banshareActionSettings.severity, severity)),
                });

                const lines: string[] = [];

                for (const sev of severity === null ? ["P0", "P1", "P2", "DM"] : [severity])
                    for (const mm of memberMode === null ? [false, true] : [memberMode === 1]) {
                        const item = settings.find((s) => s.severity === sev && s.member === mm);
                        lines.push(`- ${sev} for ${mm ? "members" : "non-members"}: ${item?.ban ? "Ban" : "Don't Ban"}`);
                    }

                await interaction.editReply(template.info(`Current autoban settings:\n${lines.join("\n")}`));
            } else {
                const item = await db.query.banshareActionSettings.findFirst({
                    columns: { ban: true },
                    where: and(
                        eq(tables.banshareActionSettings.guild, interaction.guild.id),
                        eq(tables.banshareActionSettings.severity, severity),
                        eq(tables.banshareActionSettings.member, memberMode === 1),
                    ),
                });

                await interaction.editReply(
                    template.info(`Autoban settings for ${severity} for ${memberMode === 1 ? "members" : "non-members"}: ${item?.ban ? "Ban" : "Don't Ban"}`),
                );
            }
        } else {
            await db
                .insert(tables.banshareActionSettings)
                .values(
                    (severity === null ? ["P0", "P1", "P2", "DM"] : [severity]).flatMap((sev) =>
                        (memberMode === null ? [false, true] : [memberMode === 1]).map((mm) => ({
                            guild: interaction.guild!.id,
                            severity: sev,
                            member: mm,
                            ban,
                        })),
                    ),
                )
                .onDuplicateKeyUpdate({ set: { ban } });

            await interaction.editReply(
                template.ok(
                    `Autoban action for ${
                        severity === null
                            ? memberMode === null
                                ? "everything"
                                : `${memberMode === 0 ? "non-members" : "members"} across all severities`
                            : memberMode === null
                            ? `${severities[severity]} banshares (both members and non-members)`
                            : `${severities[severity]} banshares for ${memberMode === 1 ? "members" : "non-members"}`
                    } updated to ${ban ? "Ban" : "Don't Ban"}.`,
                ),
            );

            await audit(interaction.user.id, "banshares/autoban", interaction.guild.id, { severity, memberMode, ban });
        }
    }
}
