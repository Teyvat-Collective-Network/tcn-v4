import { Message } from "discord.js";
import { and, eq, inArray, or } from "drizzle-orm";
import { z } from "zod";
import bot, { channels } from "../bot.js";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { renderHQBanshare, severities, updateBanshareDashboard } from "../lib/banshares.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(
        z.object({
            author: zs.snowflake,
            ids: z.string().regex(/^\s*[1-9][0-9]{16,19}(\s+[1-9][0-9]{16,19})*\s*$/),
            reason: z.string().trim().min(1).max(498),
            evidence: z.string().trim().min(1).max(1000),
            server: zs.snowflake,
            severity: z.string().trim().min(1).max(8),
            urgent: z.boolean(),
        }),
    )
    .output(z.string().nullable())
    .mutation(
        trpcify(async ({ author, ids, reason, evidence, server, severity, urgent }) => {
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
                return "You cannot ban TCN server owners or council advisors. Please submit the banshare without them (if there are other users) and contact the observers (you can find a link to the contact page on the home site).";

            if (!severities[severity]) return "Invalid severity.";

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
                    if (await db.query.banlists.findFirst({ where: eq(tables.banlists.uuid, uuid) })) continue;
                    await db.insert(tables.banlists).values({ uuid, content: display });
                    display = `${process.env.DOMAIN}/banlist/${uuid}`;
                    break;
                } while (true);

            const [{ insertId }] = await db.insert(tables.banshares).values({
                message: "",
                author,
                display,
                usernames: usernames.length > 1024 ? "" : usernames,
                reason,
                evidence,
                server,
                severity,
                urgent,
                reminded: Date.now(),
                status: "pending",
            });

            await db.insert(tables.banshareIds).values(idList.map((id) => ({ ref: insertId, user: id })));

            let message: Message;

            try {
                message = await channels.banshareLogs.send(await renderHQBanshare(insertId));
            } catch (error) {
                channels.logs.send(`Error posting banshare: ${error}`);
                console.error(error);
                return "Error posting your banshare. This issue has been reported.";
            }

            await db.update(tables.banshares).set({ message: message.id }).where(eq(tables.banshares.id, insertId));
            updateBanshareDashboard();

            const role = urgent ? process.env.ROLE_OBSERVERS! : process.env.ROLE_BANSHARE_PING!;

            channels.execManagement.send({
                content: `<@&${role}> [A banshare](<${message.url}>) was just submitted for review.`,
                allowedMentions: { roles: [role] },
            });

            return null;
        }),
    );
