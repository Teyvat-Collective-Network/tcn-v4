import { TimestampStyles, escapeMarkdown } from "discord.js";
import { z } from "zod";
import { channels } from "../bot.js";
import { proc } from "../trpc.js";

export default {
    submitApplication: proc
        .input(
            z.object({
                user: z.string(),
                invite: z.string(),
                experience: z.string(),
                goals: z.string(),
                history: z.string(),
                additional: z.string(),
            }),
        )
        .output(z.tuple([z.string(), z.boolean()]))
        .mutation(async ({ input: { user, invite, experience, goals, history, additional } }): Promise<[string, boolean]> => {
            if (!invite.trim()) return ["Please enter your server's invite.", false];

            // const data = await bot.fetchInvite(invite).catch(() => null);
            // if (!data) return ["Error fetching invite (invalid, or an error occurred).", false];
            // if (!data.guild) return ["Invalid invite.", false];
            // if (data.expiresAt) return ["Please enter a permanent invite (one that will not expire).", false];
            // if (data.guild.vanityURLCode === data.code) return ["Please enter an invite that is not the vanity invite.", false];

            const data = {
                guild: { name: "Shenhe Mains | Genshin Impact", createdTimestamp: Date.now() },
                url: "https://discord.gg/9waXTzWdVP",
                memberCount: 1234,
            };

            if (experience.length > 1024) return ["Experience must not exceed 1024 characters.", false];
            if (!goals.trim()) return ["Please fill out the short- and long-term goals section.", false];
            if (goals.length > 1024) return ["Goals must not exceed 1024 characters.", false];
            if (!history.trim()) return ["Please fill out the server history section.", false];
            if (history.length > 1024) return ["History must not exceed 1024 characters.", false];
            if (additional.length > 1024) return ["Additional section must not exceed 1024 characters.", false];

            const thread = await channels.applicants.threads.create({
                name: data.guild.name,
                message: {
                    content: data.url,
                    embeds: [
                        {
                            title: "New Application",
                            description: `<@${user}> applied for **${escapeMarkdown(data.guild.name)}**. The server has ${
                                data.memberCount
                            } members and was created <t:${Math.floor(data.guild.createdTimestamp / 1000)}:${TimestampStyles.RelativeTime}>.`,
                            color: 0x2b2d31,
                        },
                    ],
                },
                appliedTags: [process.env.TAG_NEW_APPLICANT!],
            });

            await channels.officialBusiness.send(
                `<@&${process.env.ROLE_NEW_APPLICANT_ALERT}> <@${user}> submitted an application for **${escapeMarkdown(
                    data.guild.name,
                )}** to join the TCN. Please check it out in ${channels.applicants} here: ${thread.lastMessage?.url}`,
            );

            await thread.send({
                embeds: [
                    {
                        fields: [
                            { name: "Prior Experience", value: experience || "N/A" },
                            { name: "Future Goals", value: goals || "N/A" },
                            { name: "Server History", value: history || "N/A" },
                            { name: "Additional Questions/Comments", value: additional || "N/A" },
                        ],
                        color: 0x2b2d31,
                        footer: { text: "Observers: use /application to update this application." },
                    },
                ],
            });

            return ["", true];
        }),
};
