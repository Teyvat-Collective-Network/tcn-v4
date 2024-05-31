import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, ApplicationCommandType, ChannelType, ChatInputCommandInteraction } from "discord.js";
import { eq } from "drizzle-orm";
import bot from "../../bot.js";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { cmdKey, displayPartnerList, ensureObserver, ensureTCN, template } from "../../lib/bot-lib.js";
import { syncPartnerList } from "../autosync/index.js";

export default {
    type: ApplicationCommandType.ChatInput,
    name: "autosync",
    description: "manage autosync settings",
    options: [
        {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: "channel",
            description: "set the autosync output channel",
            options: [
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "set",
                    description: "set the autosync output channel",
                    options: [
                        {
                            type: ApplicationCommandOptionType.Channel,
                            name: "channel",
                            description: "the channel to set as the autosync output channel",
                            required: true,
                            channelTypes: [ChannelType.GuildText],
                        },
                    ],
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: "webhook",
            description: "set the autosync output webhook",
            options: [
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "set",
                    description: "set the autosync output webhook",
                    options: [
                        {
                            type: ApplicationCommandOptionType.String,
                            name: "webhook",
                            description: "the webhook URL",
                            required: true,
                        },
                    ],
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: "mode",
            description: "set the autosync output mode",
            options: [
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "set",
                    description: "set the autosync output mode",
                    options: [
                        {
                            type: ApplicationCommandOptionType.String,
                            name: "mode",
                            description: "the mode to set",
                            required: true,
                            choices: [
                                { name: "Edit In-Place", value: "edit" },
                                { name: "Delete & Repost", value: "repost" },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "update",
            description: "update the partner list",
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "disable",
            description: "disable autosync in your server",
        },
    ],
} satisfies ApplicationCommandDataResolvable;

async function purge(settings?: { location: "disabled" | "channel" | "webhook"; channel: string | null; webhook: string | null; message: string | null }) {
    if (!settings?.message) return;
    if (settings.location === "disabled") return;

    if (settings.location === "channel") {
        if (!settings.channel) return;

        const channel = await bot.channels.fetch(settings.channel);
        if (!channel?.isTextBased()) return;

        const message = await channel.messages.fetch(settings.message);
        await message.delete().catch(() => null);
    } else {
        if (!settings.webhook) return;
        await fetch(`${settings.webhook}/messages/${settings.message}`, { method: "DELETE" });
    }
}

export async function handleAutosync(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    await ensureTCN(interaction);
    if (!interaction.guild) return;

    if (interaction.user.id !== interaction.guild.ownerId)
        await ensureObserver(interaction).catch(() => {
            throw "Only the server owner can manage autosync settings.";
        });

    const key = cmdKey(interaction);

    if (key === "channel/set") {
        const channel = await bot.channels.fetch(interaction.options.getChannel("channel", true).id);
        if (channel?.type !== ChannelType.GuildText) throw "Unexpectedly, the channel type is wrong. Please report this as a bug.";

        const entry = await db.query.autosyncSettings.findFirst({
            columns: { location: true, channel: true, webhook: true, message: true },
            where: eq(tables.autosyncSettings.guild, interaction.guild.id),
        });

        if (entry?.location === "channel" && entry.channel === channel.id)
            throw "The channel is already set as the autosync channel. If you want to pull an updated version, use `/autosync update` instead.";

        purge(entry);

        const message = await channel.send(await displayPartnerList(false)).catch(() => {
            throw "Failed to post autosync message. Please check the channel's permissions.";
        });

        await db
            .insert(tables.autosyncSettings)
            .values({ guild: interaction.guild.id, location: "channel", channel: channel.id, message: message.id })
            .onDuplicateKeyUpdate({ set: { location: "channel", channel: channel.id, message: message.id } });

        await interaction.editReply(template.ok(`The partner list will be kept in sync in ${channel}.`));
    } else if (key === "webhook/set") {
        const input = interaction.options.getString("webhook", true);
        if (!input.match(/^https:\/\/(\w+\.)?discord.com\/api\/webhooks\/\d+\/[\w-]+$/)) throw "Invalid webhook URL.";

        const req = await fetch(input);
        if (!req.ok) throw "Invalid webhook URL.";

        const data = (await req.json()) as { guild_id: string; channel_id: string; url: string };
        if (data.guild_id !== interaction.guild.id) throw "The webhook is not in this server.";
        const url = data.url;

        const entry = await db.query.autosyncSettings.findFirst({
            columns: { location: true, channel: true, webhook: true, message: true },
            where: eq(tables.autosyncSettings.guild, interaction.guild.id),
        });

        if (entry?.location === "webhook" && entry.channel === url)
            throw "The webhook is already set as the autosync output location. If you want to pull an updated version, use `/autosync update` instead.";

        purge(entry);

        const sendReq = await fetch(`${url}?wait=true`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(await displayPartnerList(false)),
        });

        if (!sendReq.ok) throw "Failed to post autosync message. Please try again and report this as a bug if the issue persists.";

        const { id } = (await sendReq.json()) as { id: string };

        await db
            .insert(tables.autosyncSettings)
            .values({ guild: interaction.guild.id, location: "webhook", webhook: url, message: id })
            .onDuplicateKeyUpdate({ set: { location: "webhook", webhook: url, message: id } });

        await interaction.editReply(template.ok(`The partner list will be kept in sync in <#${data.channel_id}>.`));
    } else if (key === "mode/set") {
        const mode = interaction.options.getString("mode", true);

        if (!["edit", "repost"].includes(mode)) throw "Invalid mode.";

        await db
            .insert(tables.autosyncSettings)
            .values({ guild: interaction.guild.id, location: "disabled", repost: mode === "repost" })
            .onDuplicateKeyUpdate({ set: { repost: mode === "repost" } });

        await interaction.editReply(template.ok(`Autosync will ${mode === "repost" ? "delete and repost" : "edit"} the partner list.`));
    } else if (key === "update") {
        const entry = await db.query.autosyncSettings.findFirst({ where: eq(tables.autosyncSettings.guild, interaction.guild.id) });

        await syncPartnerList(entry, await displayPartnerList(false));

        await interaction.editReply(template.ok("The partner list has been updated."));
    } else if (key === "disable") {
        const entry = await db.query.autosyncSettings.findFirst({
            columns: { location: true, channel: true, webhook: true, message: true },
            where: eq(tables.autosyncSettings.guild, interaction.guild.id),
        });

        purge(entry);

        await db
            .insert(tables.autosyncSettings)
            .values({ guild: interaction.guild.id, location: "disabled" })
            .onDuplicateKeyUpdate({ set: { location: "disabled" } });

        await interaction.editReply(template.ok("Autosync has been disabled."));
    }
}
