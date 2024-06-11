import { escapeMarkdown } from "discord.js";
import bot, { HQ, channels } from "../../bot.js";
import { db } from "../../db/db.js";
import { englishList } from "../../lib.js";
import { trackMetrics } from "../../lib/metrics.js";

async function check() {
    await trackMetrics("issue-detector", async () => {
        const guilds = await db.query.guilds.findMany();
        const alerts: string[] = [];

        for (const guild of guilds)
            try {
                const invite = await bot.fetchInvite(guild.invite);
                if (!invite || invite.guild?.id !== guild.id) throw null;
            } catch {
                alerts.push(`Invite for **${escapeMarkdown(guild.name)}** (\`${guild.id}\`) is invalid (\`${guild.invite}\`).`);
            }

        const expected = new Set<string>();

        for (const { id, owner, advisor } of guilds) {
            expected.add(owner);
            if (advisor) expected.add(advisor);

            const guild = await bot.guilds.fetch(id).catch(() => null);
            if (guild === null) continue;

            if (guild.ownerId !== owner)
                alerts.push(`Server owner for **${escapeMarkdown(guild.name)}** (\`${guild.id}\`) should be <@${guild.ownerId}> but is set as <@${owner}>.`);
        }

        for (const member of (await HQ.members.fetch()).values())
            if (!member.user.bot && !expected.has(member.id)) alerts.push(`${member} is not authorized to be in HQ.`);

        const positions: Record<string, string[]> = {};

        for (const guild of guilds)
            for (const [id, role] of [
                [guild.owner, "server owner"],
                [guild.advisor, "council advisor"],
            ])
                if (id) {
                    (positions[id] ??= []).push(`**${escapeMarkdown(guild.name)}** (\`${guild.id}\`) ${role}`);

                    try {
                        if (!(await HQ.members.fetch(id))) throw null;
                    } catch {
                        try {
                            const user = await bot.users.fetch(id);
                            alerts.push(`${user} (${role} for **${escapeMarkdown(guild.name)}** (\`${guild.id}\`)) is missing from HQ.`);
                        } catch {
                            alerts.push(`${role} for **${escapeMarkdown(guild.name)}** (\`${guild.id}\`) is an invalid user ID: \`${id}\`.`);
                        }
                    }
                }

        for (const [id, list] of Object.entries(positions)) if (list.length > 1) alerts.push(`<@${id}> has multiple council positions: ${englishList(list)}`);

        if (alerts.length === 0) return;

        let texts = ["### Server/API Issues Detected"];

        for (const line of alerts)
            if (texts.at(-1)!.length + line.length + 3 <= 2000) texts[texts.length - 1] += `\n- ${line}`;
            else texts.push(line);

        for (const text of texts) await channels.observerManagement.send(text);
    });
}

setTimeout(() => {
    check();
    setInterval(check, 86400000);
}, 86400000 - (Date.now() % 86400000));
