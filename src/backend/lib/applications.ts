import { Guild, Invite, InviteGuild, escapeMarkdown } from "discord.js";
import { channels } from "../bot.js";
import { timeinfo } from "../lib.js";

export const applicationThreadTagToStatus = {
    [process.env.TAG_APPLICANT_PENDING!]: "pending",
    [process.env.TAG_APPLICANT_VOTING_TO_DECLINE!]: "voting-to-decline",
    [process.env.TAG_APPLICANT_REJECTED!]: "rejected",
    [process.env.TAG_APPLICANT_OBSERVING!]: "observing",
    [process.env.TAG_APPLICANT_VOTING_TO_CANCEL!]: "voting-to-cancel",
    [process.env.TAG_APPLICANT_OBSERVATION_FINISHED!]: "observation-finished",
    [process.env.TAG_APPLICANT_VOTING!]: "voting",
    [process.env.TAG_APPLICANT_PRE_APPROVED!]: "pre-approved",
    [process.env.TAG_APPLICANT_INDUCTED!]: "inducted",
} as const;

export const applicationThreadStatusToTag: Record<(typeof applicationThreadTagToStatus)[keyof typeof applicationThreadTagToStatus], string> = {
    pending: process.env.TAG_APPLICANT_PENDING!,
    "voting-to-decline": process.env.TAG_APPLICANT_VOTING_TO_DECLINE!,
    rejected: process.env.TAG_APPLICANT_REJECTED!,
    observing: process.env.TAG_APPLICANT_OBSERVING!,
    "voting-to-cancel": process.env.TAG_APPLICANT_VOTING_TO_CANCEL!,
    "observation-finished": process.env.TAG_APPLICANT_OBSERVATION_FINISHED!,
    voting: process.env.TAG_APPLICANT_VOTING!,
    "pre-approved": process.env.TAG_APPLICANT_PRE_APPROVED!,
    inducted: process.env.TAG_APPLICANT_INDUCTED!,
} as const;

export async function createApplicationThread(
    user: string,
    invite: Invite,
    guild: InviteGuild | Guild,
    experience: string,
    goals: string,
    history: string,
    additional: string,
    name?: string,
) {
    name ??= guild.name;

    return await channels.applicants.threads.create({
        name: name.slice(0, 80),
        message: {
            content: `${invite}`,
            embeds: [
                {
                    title: "New Application",
                    description: `<@${user}> applied for **${escapeMarkdown(name)}**. The server has ${
                        invite.memberCount
                    } members and was created on ${timeinfo(guild.createdAt)}}.`,
                    color: 0x2b2d31,
                    fields: [
                        { name: "Prior Experience", value: experience || "N/A" },
                        { name: "Future Goals", value: goals || "N/A" },
                        { name: "Server History", value: history || "N/A" },
                        { name: "Additional", value: additional || "N/A" },
                    ],
                },
            ],
        },
        appliedTags: [process.env.TAG_APPLICANT_PENDING!],
    });
}
