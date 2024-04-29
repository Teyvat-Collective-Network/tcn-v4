import { ButtonStyle, ChannelType, Client, ComponentType, Events, PermissionFlagsBits, TextInputStyle } from "discord.js";
import { api } from "../api.js";
import { banshareComponents, updateBanshareDashboard } from "../banshares.js";
import { channels } from "../bot.js";
import { isTCN } from "../lib.js";
import template from "../template.js";

export default function (bot: Client<true>) {
    bot.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isStringSelectMenu() && interaction.customId === "banshare-action") {
            const [action] = interaction.values;
            if (!action) return void interaction.update({});

            await interaction.deferReply({ ephemeral: true });

            if (action === "lock") {
                if (!(await api.lockBanshare.mutate(interaction.message.id)))
                    return void interaction.editReply(template.error("This banshare is already locked or is no longer pending."));

                await interaction.message.edit({ components: banshareComponents(interaction.message.embeds[0].fields.at(-1)!.value, true, "pending") });
                await interaction.editReply(template.ok("This banshare is now locked."));

                await channels.execManagement.send(`${interaction.message.url} was locked by ${interaction.user}.`);
            } else if (action === "unlock") {
                if (!(await api.isObserver.query(interaction.user.id)))
                    return void interaction.editReply(template.error("You must be an observer to unlock a banshare."));

                if (!(await api.unlockBanshare.mutate(interaction.message.id)))
                    return void interaction.editReply(template.error("This banshare is no longer locked."));

                await interaction.message.edit({ components: banshareComponents(interaction.message.embeds[0].fields.at(-1)!.value, false, "pending") });
                await interaction.editReply(template.ok("This banshare is now unlocked."));

                await channels.logs.send(`${interaction.message.url} was unlocked by ${interaction.user}.`);
            } else if (action.startsWith("set-")) {
                if (!(await api.isObserver.query(interaction.user.id)))
                    return void interaction.editReply(template.error("You must be an observer to edit a banshare's severity."));

                const severity = action.slice(4);

                if (!(await api.setBanshareSeverity.mutate({ message: interaction.message.id, severity })))
                    return void interaction.editReply(
                        template.error("This banshare is no longer pending or its severity was already changed to the value you input."),
                    );

                await interaction.message.edit({
                    components: banshareComponents(severity, false, "pending"),
                    embeds: [
                        {
                            ...interaction.message.embeds[0].toJSON(),
                            fields: [...interaction.message.embeds[0].fields.slice(0, -1), { name: "Severity", value: severity }],
                        },
                    ],
                });

                await interaction.editReply(template.ok(`This banshare's severity was updated to ${severity}.`));

                await channels.logs.send(`${interaction.message.url} was changed to ${severity} by ${interaction.user}.`);
            } else if (action === "reject" || action === "publish" || action === "publish-no-global") {
                if (!(await api.isObserver.query(interaction.user.id)))
                    return void interaction.editReply(template.error("You must be an observer to process banshares."));

                await interaction.editReply({
                    components: [
                        {
                            type: ComponentType.ActionRow,
                            components: [
                                {
                                    type: ComponentType.Button,
                                    customId: `banshare-${action}`,
                                    style: ButtonStyle.Success,
                                    label: `Confirm ${
                                        { reject: "Rejection", publish: "Publication + Global Ban", "publish-no-global": "Publication (No Global Ban)" }[action]
                                    }`,
                                },
                            ],
                        },
                    ],
                });
            }
        } else if (interaction.isButton() && interaction.customId === "banshare-reject") {
            await interaction.deferUpdate();

            if (!(await api.isObserver.query(interaction.user.id)))
                return void interaction.editReply(template.error("You must be an observer to process banshares."));

            const message = await interaction.message.fetchReference().catch(() => null);
            if (!message) return void interaction.editReply(template.error("Could not fetch the banshare to which this refers."));

            if (!(await api.rejectBanshare.mutate(message.id))) return void interaction.editReply(template.error("This banshare is no longer pending."));

            await message.edit({
                components: banshareComponents("-", false, "rejected"),
                embeds: [{ ...message.embeds[0].toJSON(), fields: message.embeds[0].fields.slice(0, -1) }],
            });

            await interaction.editReply(template.ok("This banshare has been rejected."));

            await channels.logs.send(`${message.url} was rejected by ${interaction.user}.`);
            await updateBanshareDashboard();
        } else if (interaction.isButton() && (interaction.customId === "banshare-publish" || interaction.customId === "banshare-publish-no-global")) {
            await interaction.deferUpdate();

            if (!(await api.isObserver.query(interaction.user.id)))
                return void interaction.editReply(template.error("You must be an observer to process banshares."));

            const message = await interaction.message.fetchReference().catch(() => null);
            if (!message) return void interaction.editReply(template.error("Could not fetch the banshare to which this refers."));

            if (!(await api.publishBanshare.mutate(message.id))) return void interaction.editReply(template.error("This banshare is no longer pending."));

            await message.edit({ components: banshareComponents("-", false, "published") });

            await interaction.editReply(
                template.ok(`This banshare is being published. You may dismiss this message now. Any issues will be logged in ${channels.logs}.`),
            );

            const root = await channels.logs.send(`${message.url} was published by ${interaction.user}.`);

            if (interaction.customId === "banshare-publish")
                await api.globalBan
                    .mutate({ channel: 1, users: await api.getBanshareIds.query(message.id) })
                    .catch(() => root.reply("An error occurred banning these users from global chat. This operation will be skipped."));

            const hubPost = await channels.hubBanshares.send({ embeds: message.embeds });
            await api.setBanshareHubPost.mutate({ message: message.id, hubPost: hubPost.id });

            await updateBanshareDashboard();
        } else if (interaction.isButton() && interaction.customId === "banshare-rescind") {
            if (!(await api.isObserver.query(interaction.user.id)))
                return void interaction.editReply(template.error("You must be an observer to rescind banshares."));

            await interaction.showModal({
                title: "Rescind Banshare",
                customId: `banshare-rescind-confirm/${interaction.message.id}`,
                components: [
                    {
                        type: ComponentType.ActionRow,
                        components: [
                            {
                                type: ComponentType.TextInput,
                                customId: "explanation",
                                style: TextInputStyle.Paragraph,
                                label: "Explanation",
                                required: true,
                                maxLength: 1000,
                            },
                        ],
                    },
                ],
            });
        } else if (interaction.isModalSubmit() && interaction.customId.startsWith("banshare-rescind-confirm/")) {
            await interaction.deferReply({ ephemeral: true });

            if (!(await api.isObserver.query(interaction.user.id)))
                return void interaction.editReply(template.error("You must be an observer to rescind banshares."));

            const message = interaction.customId.slice(25);

            if (!(await api.rescindBanshare.mutate(message))) return void interaction.editReply(template.error("This banshare has already been rescinded."));

            await interaction.editReply(template.ok("This banshare is being rescinded. You may dismiss this message."));

            const explanation = interaction.fields.getTextInputValue("explanation");
            const text = `This banshare was rescinded by an observer with the following explanation:\n\n>>> ${explanation}`;

            try {
                const msg = await channels.banshareLogs.messages.fetch(message);
                await msg.edit({ components: banshareComponents("-", false, "rescinded") });
                await msg.reply(text);
                channels.logs.send(`${msg.url} was rescinded by ${interaction.user.id}.`);
            } catch {}

            try {
                const hubPost = await api.getBanshareHubPost.query(message);
                if (!hubPost) throw 0;
                const msg = await channels.hubBanshares.messages.fetch(hubPost);
                await msg.reply(text);
            } catch {}

            for (const { channel, originChannel, message: id } of await api.getBanshareCrossposts.query(message))
                try {
                    const ch = await bot.channels.fetch(originChannel);
                    if (ch?.type !== ChannelType.GuildText) throw 0;

                    const msg = await ch.messages.fetch(id);

                    if (channel === originChannel) await msg.reply(text);
                    else {
                        const output = await bot.channels.fetch(channel!);
                        if (output?.type !== ChannelType.GuildText) throw 0;
                        await output.send(`${msg.url} was rescinded by an observer with the following explanation:\n\n>>> ${explanation}`);
                    }
                } catch {}
        } else if (interaction.isButton() && interaction.customId === "banshare-execute") {
            if (!interaction.guild) return;

            if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers))
                return void interaction.reply(template.error("You must have permission to ban members in this server."));

            await interaction.deferReply({ ephemeral: true });

            if (!(await isTCN(interaction.guild))) return void interaction.editReply(template.error("This is not a TCN server."));

            if (!(await api.executeBanshare.mutate({ guild: interaction.guild.id, message: interaction.message.id, executor: interaction.user.id })))
                return void interaction.editReply(template.error("This banshare is already being executed."));

            await interaction.message.edit({ components: [] });
            await interaction.editReply(template.ok("Executing banshare; you may dismiss this message."));
        } else if (interaction.isButton() && interaction.customId === "banshare-dismiss") {
            if (!interaction.guild) return;

            if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers))
                return void interaction.reply(template.error("You must have permission to ban members in this server."));

            await interaction.update({ components: [] });
        } else if (interaction.isChatInputCommand() && interaction.commandName === "banshares") {
            if (!interaction.guild) return;

            if (interaction.guild.ownerId !== interaction.user.id)
                return void interaction.reply(template.error("You must be the server owner to manage banshare settings."));

            await interaction.deferReply({ ephemeral: true });

            if (!(await isTCN(interaction.guild))) return void interaction.editReply(template.error("This is not a TCN server."));

            const group = interaction.options.getSubcommandGroup(false);
            const sub = interaction.options.getSubcommand(false);
            const key = group ? `${group}/${sub}` : sub;

            if (key === "subscribe") {
                const channel = interaction.options.getChannel("channel") ?? interaction.channel!;
                if (channel.type !== ChannelType.GuildText) return void interaction.editReply(template.error("You must select a normal text channel."));
                await api.setBanshareOutputChannel.mutate({ guild: interaction.guild.id, channel: channel.id });

                await interaction.editReply(template.ok(`Banshares will now be posted to ${channel}.`));
            } else if (key === "unsubscribe") {
                await api.clearBanshareOutputChannel.mutate(interaction.guild.id);
                await interaction.editReply(template.ok("This server will no longer receive banshares."));
            } else if (key === "log/enable") {
                const channel = interaction.options.getChannel("channel") ?? interaction.channel!;
                if (channel.type !== ChannelType.GuildText) return void interaction.editReply(template.error("You must select a normal text channel."));

                if (!(await api.addBanshareLogChannel.mutate({ guild: interaction.guild.id, channel: channel.id })))
                    return void interaction.editReply(template.error(`${channel} is already a banshare log channel.`));

                await interaction.editReply(template.ok(`Banshare actions will now be logged to ${channel}.`));
            } else if (key === "log/disable") {
                const channel = interaction.options.getChannel("channel") ?? interaction.channel!;
                if (channel.type !== ChannelType.GuildText) return void interaction.editReply(template.error("You must select a normal text channel."));

                if (!(await api.removeBanshareLogChannel.mutate({ guild: interaction.guild.id, channel: channel.id })))
                    return void interaction.editReply(template.error(`${channel} is not a banshare log channel.`));

                await interaction.editReply(template.ok(`Banshare actions will no longer be logged to ${channel}.`));
            } else if (key === "daedalus/enable" || key === "daedalus/disable") {
                const enable = key === "daedalus/enable";
                await api.setDaedalusIntegration.mutate({ guild: interaction.guild.id, enable });
                await interaction.editReply(template.ok(`Daedalus integration has been ${enable ? "enabled" : "disabled"}.`));
            } else if (key === "autoban") {
                const severity = interaction.options.getString("severity", false);
                const mode = interaction.options.getInteger("mode", false);

                const settings = (await api.getAutobanMode.query(interaction.guild.id)) as Record<string, [boolean, boolean]>;

                const modeObject: [boolean, boolean] = mode === null ? [false, false] : [mode >= 2, mode % 2 === 1];
                const modeName = ["never", "only ban members", "only ban non-members", "always"][mode ?? 0];

                if (severity === null)
                    if (mode === null)
                        await interaction.editReply(
                            template.info(
                                `This server's current autoban settings are:\n\n${["P0", "P1", "P2", "DM"]
                                    .map<[string, boolean, boolean]>((sev) => [sev, ...(settings[sev] ?? [false, false])])
                                    .map(
                                        ([sev, nonmembers, members]) =>
                                            `- ${sev}: ${nonmembers ? (members ? "always" : "only ban non-members") : members ? "only ban members" : "never"}`,
                                    )
                                    .join("\n")}`,
                            ),
                        );
                    else {
                        await api.setAutobanMode.mutate({
                            guild: interaction.guild.id,
                            mode: Object.fromEntries(["P0", "P1", "P2", "DM"].map<[string, [boolean, boolean]]>((sev) => [sev, modeObject])),
                        });

                        await interaction.editReply(template.ok(`Set the autoban rule to "${modeName}" for all severities.`));
                    }
                else if (mode === null)
                    await interaction.editReply(
                        template.info(
                            `This server's current autoban mode for ${severity} banshares is to ${((nonmembers, members) =>
                                nonmembers ? (members ? "always ban" : "only ban non-members") : members ? "only ban members" : "never ban")(
                                ...(settings[severity] ?? [false, false]),
                            )}.`,
                        ),
                    );
                else {
                    await api.setAutobanMode.mutate({ guild: interaction.guild.id, mode: { ...settings, [severity]: modeObject } });
                    await interaction.editReply(template.ok(`Set the autoban rule for ${severity} banshares to "${modeName}".`));
                }
            }
        }
    });
}
