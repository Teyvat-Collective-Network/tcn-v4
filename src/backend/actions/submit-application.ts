import { escapeMarkdown } from "discord.js";
import { z } from "zod";
import bot, { channels } from "../bot.js";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { createApplicationThread } from "../lib/applications.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(
        z.object({
            user: zs.snowflake,
            invite: z.string(),
            experience: z.string().max(1024),
            goals: z.string().max(1024).trim().min(1),
            history: z.string().max(1024).trim().min(1),
            additional: z.string().max(1024),
        }),
    )
    .output(z.string().nullable())
    .mutation(
        trpcify(async ({ user, invite, experience, goals, history, additional }) => {
            const data = await bot.fetchInvite(invite).catch(() => null);

            if (!data?.guild || !!data.expiresAt || data.code === data.guild.vanityURLCode)
                return 'That invite is no longer valid. Please enter a new one (you can click "Change Server" without losing your work).';

            try {
                const thread = await createApplicationThread(user, data, data.guild, experience, goals, history, additional);

                await db.insert(tables.applications).values({
                    thread: thread.id,
                    guild: data.guild.id,
                    invite: data.code,
                    url: `${thread.url}/${thread.id}`,
                    user,
                    name: data.guild.name,
                    experience,
                    goals,
                    history,
                    additional,
                });

                await channels.officialBusiness.send({
                    content: `<@&${process.env.ROLE_NEW_APPLICANT_ALERT}> <@${user}> submitted an application for **${escapeMarkdown(
                        data.guild.name,
                    )}**. See the application here: ${thread.url}/${thread.id}`,
                    allowedMentions: { roles: [process.env.ROLE_NEW_APPLICANT_ALERT!] },
                });

                return null;
            } catch (e) {
                console.error(e);
                channels.logs.send(`<@&${process.env.ROLE_TECH_TEAM}> Error processing an application (user: \`${user}\`): ${e}`);
                return "An unexepcted error occurs. This incident has been reported. Please try again later.";
            }
        }),
    );
