import { TimestampStyles, escapeMarkdown } from "discord.js";
import { z } from "zod";
import { api } from "../api.js";
import { banshareComponents } from "../banshares.js";
import bot, { channels } from "../bot.js";
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

            const data = await bot.fetchInvite(invite).catch(() => null);
            if (!data) return ["Error fetching invite (invalid, or an error occurred).", false];
            if (!data.guild) return ["Invalid invite.", false];
            if (data.expiresAt) return ["Please enter a permanent invite (one that will not expire).", false];
            if (data.guild.vanityURLCode === data.code) return ["Please enter an invite that is not the vanity invite.", false];

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

            await channels.officialBusiness.send({
                content: `<@&${process.env.ROLE_NEW_APPLICANT_ALERT}> <@${user}> submitted an application for **${escapeMarkdown(
                    data.guild.name,
                )}** to join the TCN. Please check it out in ${channels.applicants} here: ${thread.lastMessage?.url}`,
                allowedMentions: { roles: [process.env.ROLE_NEW_APPLICANT_ALERT!] },
            });

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
    submitBanshare: proc
        .input(
            z.object({
                user: z.string(),
                ids: z.string(),
                reason: z.string(),
                evidence: z.string(),
                server: z.string(),
                severity: z.string(),
                urgent: z.boolean(),
                validate: z.boolean(),
            }),
        )
        .output(z.tuple([z.string(), z.boolean()]))
        .mutation(async ({ input: { user, ids, reason, evidence, server, severity, urgent, validate } }): Promise<[string, boolean]> => {
            if (!reason.trim()) return ["Please enter the reason.", false];
            if (reason.length > 498) return ["Reason must not exceed 498 characters.", false];
            if (!evidence.trim()) return ["Please enter the evidence.", false];
            if (evidence.length > 1000) return ["Evidence must not exceed 1000 characters.", false];
            if (!server.trim()) return ["Please select the server from which you are submitting this banshare.", false];
            if (!(await api.validateBansharePermission.query({ user, guild: server })))
                return ["You do not have permission to submit banshares from this server.", false];
            if (!["P0", "P1", "P2", "DM"].includes(severity)) return ["Please select the severity of this banshare.", false];

            ids = ids.trim();

            if (!ids) return ["Please enter the ID(s) of the offender(s).", false];
            if (!ids.match(/^\d+(\s+\d+)*$/))
                return ["Your ID list looks invalid. It should consist of space-separated IDs (where each ID is a string of digits)", false];

            const idList: string[] = [];
            const set = new Set<string>();

            for (const id of ids.split(/\s+/))
                if (!set.has(id)) {
                    idList.push(id);
                    set.add(id);
                }

            if (idList.some((x) => !x.match(/^[1-9][0-9]{16,19}$/)))
                return ["One or more of your IDs looks invalid. Each ID should be a string of 17-20 digits starting with a non-zero digit.", false];

            const usernames: string[] = [];

            if (validate)
                for (const id of idList)
                    try {
                        usernames.push((await bot.users.fetch(id)).tag);
                    } catch {
                        return [`One or more of your IDs does not correspond to a valid user (${id}, but there may be more).`, false];
                    }

            let idDisplay: string | null = idList.join(" ");
            if (idDisplay.length > 1024) idDisplay = await api.createBanlist.mutate(idDisplay).catch(() => null);

            if (idDisplay === null)
                return ["An issue occurred saving your banshare's ID list to a document. Please try again later or contact an observer.", false];

            const usernamesJoined = usernames.join(" ");
            const usernameDisplay = usernames.length > 0 && usernamesJoined.length <= 1024 ? usernamesJoined : null;

            const { id } = await channels.banshareLogs.send({
                embeds: [
                    {
                        title: "Banshare",
                        color: 0x2b2d31,
                        fields: [
                            { name: "ID(s)", value: idDisplay },
                            usernameDisplay ? { name: "Username(s)", value: usernameDisplay } : [],
                            { name: "Reason", value: reason },
                            { name: "Evidence", value: evidence },
                            { name: "Submitted By", value: `<@${user}> (${(await bot.users.fetch(user)).tag}) from ${await api.getGuildName.query(server)}` },
                            { name: "Severity", value: severity },
                        ].flat(),
                    },
                ],
                components: banshareComponents(severity, false, "pending"),
            });

            await api.submitBanshare.mutate({
                message: id,
                ids: idList,
                reason,
                evidence,
                author: user,
                guild: server,
                severity,
                urgent,
                idDisplay,
                usernameDisplay,
            });

            const role = urgent ? process.env.ROLE_OBSERVERS : process.env.ROLE_BANSHARE_PING;

            await channels.execManagement.send({
                content: `<@&${role}> A banshare was just submitted. Please review it in ${channels.banshareLogs}.`,
                allowedMentions: { roles: [role!] },
            });

            return ["", true];
        }),
};
