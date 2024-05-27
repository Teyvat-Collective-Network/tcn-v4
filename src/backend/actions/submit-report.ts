import crypto from "crypto";
import { Message } from "discord.js";
import { and, eq, inArray, or } from "drizzle-orm";
import { z } from "zod";
import bot, { channels } from "../bot.js";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { renderHQReport, updateReportsDashboard } from "../lib/reports.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(
        z.object({
            author: zs.snowflake,
            ids: z.string().regex(/^\s*[1-9][0-9]{16,19}(\s+[1-9][0-9]{16,19})*\s*$/),
            reason: z.string().trim().min(1).max(480),
            evidence: z.string().trim().min(1).max(1000),
            server: zs.snowflake,
            category: z.enum(["banshare", "advisory", "hacked"]),
            urgent: z.boolean(),
        }),
    )
    .output(z.string().nullable())
    .mutation(
        trpcify(async ({ author, ids, reason, evidence, server, category, urgent }) => {
            const guild = await db.query.guilds.findFirst({ columns: { name: true, owner: true, advisor: true }, where: eq(tables.guilds.id, server) });
            if (!guild) return "That guild does not exist.";

            if (
                guild.owner !== author &&
                guild.advisor !== author &&
                !(await db.query.guildStaff.findFirst({ where: and(eq(tables.guildStaff.guild, server), eq(tables.guildStaff.user, author)) }))
            )
                return "You are not a staff member in that guild.";

            const idList: string[] = [];
            const seen = new Set<string>();

            for (const id of ids.trim().split(/\s+/))
                if (!seen.has(id)) {
                    seen.add(id);
                    idList.push(id);
                }

            if (
                !!(await db.query.guilds.findFirst({
                    columns: { id: true },
                    where: or(inArray(tables.guilds.owner, idList), inArray(tables.guilds.advisor, idList)),
                }))
            )
                return "You cannot report TCN server owners or council advisors. Please submit the report without them (if there are other users) and contact the observers (you can find a link to the contact page on the home site).";

            const tags: string[] = [];

            if (idList.length <= 20)
                for (const id of idList)
                    try {
                        const user = await bot.users.fetch(id);
                        tags.push(user.tag);
                    } catch {
                        return `At least one user ID does not correspond to a valid user (e.g. ${id}).`;
                    }

            const usernames = tags.join(" ");

            let display = idList.join(" ");

            if (display.length > 1024)
                do {
                    const uuid = crypto.randomUUID();
                    if (await db.query.txts.findFirst({ where: eq(tables.txts.uuid, uuid) })) continue;
                    await db.insert(tables.txts).values({ uuid, content: display });
                    display = `${process.env.DOMAIN}/txts/${uuid}`;
                    break;
                } while (true);

            const now = Date.now();

            const [{ insertId }] = await db.insert(tables.networkUserReports).values({
                message: "",
                author,
                display,
                usernames: usernames.length > 1024 ? "" : usernames,
                reason,
                evidence,
                server,
                category,
                urgent,
                created: now,
                reminded: now,
                status: "pending",
            });

            await db.insert(tables.reportIds).values(idList.map((id) => ({ ref: insertId, user: id })));

            let message: Message;

            try {
                message = await channels.reports.send(await renderHQReport(insertId));
            } catch (error) {
                channels.logs.send(`<@&${process.env.ROLE_TECH_TEAM}> Error posting network user report : ${error}`);
                console.error(error);
                return "Error posting your network user report. This issue has been reported.";
            }

            await db.update(tables.networkUserReports).set({ message: message.id }).where(eq(tables.networkUserReports.id, insertId));
            updateReportsDashboard();

            const role = urgent ? process.env.ROLE_OBSERVERS! : process.env.ROLE_REPORTS_PING!;

            channels.observerManagement.send({
                content: `<@&${role}> [A network user report](<${message.url}>) was just submitted for review.`,
                allowedMentions: { roles: [role] },
            });

            return null;
        }),
    );
