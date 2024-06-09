import { Events } from "discord.js";
import { eq } from "drizzle-orm";
import bot, { HQ, channels } from "../../bot.js";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";

bot.on(Events.InviteCreate, async (invite) => {
    if (invite.guild?.id !== HQ.id) return;
    if (invite.inviter?.id === bot.user.id) return;

    await invite.delete().catch(() => null);
    const id = invite.inviter?.id;

    if (!id)
        return void channels.logs.send({
            content: `<@&${process.env.ROLE_TECH_TEAM}> Deleted an invite, but could not identify who created it.`,
            allowedMentions: { roles: [process.env.ROLE_TECH_TEAM!] },
        });

    const user = await db.query.users.findFirst({ columns: { observer: true }, where: eq(tables.users.id, id) }).catch(() => null);

    if (!user || user.observer)
        await channels.logs.send({ content: `<@${id}> Please create invites using \`/invite\`, not manually.`, allowedMentions: { users: [id] } });
    else
        await channels.logs.send({
            content: `<@&${process.env.ROLE_OBSERVERS}> Just deleted an invite created by <@${id}> and they are not recorded as an observer. Please investigate.`,
            allowedMentions: { roles: [process.env.ROLE_OBSERVERS!] },
        });
});
