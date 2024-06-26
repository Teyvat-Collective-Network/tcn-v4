import { Events } from "discord.js";
import { and, eq, inArray } from "drizzle-orm";
import bot from "../../bot.js";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { loop } from "../../lib/loop.js";
import { FixUserStaffStatusTask, fixGuildStaffStatusQueue, fixUserRolesQueue, fixUserStaffStatusQueue, makeWorker } from "../../queue.js";

makeWorker<FixUserStaffStatusTask>("fix-user-staff-status", async ({ guild, user }) => {
    const isStaff = !!(await db.query.guildStaff.findFirst({ where: and(eq(tables.guildStaff.guild, guild), eq(tables.guildStaff.user, user)) }));

    const force = await db.query.forcedStaff.findFirst({
        columns: { staff: true },
        where: and(eq(tables.forcedStaff.guild, guild), eq(tables.forcedStaff.user, user)),
    });

    let staff = force?.staff;

    if (staff === undefined) {
        const obj = await bot.guilds.fetch(guild);
        const member = await obj.members.fetch(user).catch(() => null);

        if (member) {
            const roles = member.roles.cache.map((role) => role.id);

            staff = !!(await db.query.autoStaffRoles.findFirst({
                where: and(eq(tables.autoStaffRoles.guild, guild), inArray(tables.autoStaffRoles.role, roles)),
            }));
        } else staff = false;
    }

    if (staff === isStaff) return;

    if (staff) await db.insert(tables.guildStaff).values({ guild, user }).onDuplicateKeyUpdate({ set: { user } });
    else await db.delete(tables.guildStaff).where(and(eq(tables.guildStaff.guild, guild), eq(tables.guildStaff.user, user)));
    await fixUserRolesQueue.add("", user);
});

makeWorker<string>("fix-guild-staff-status", async (guild) => {
    const obj = await bot.guilds.fetch(guild);
    await obj.roles.fetch();
    await obj.members.fetch();

    const roles = (await db.query.autoStaffRoles.findMany({ columns: { role: true }, where: eq(tables.autoStaffRoles.guild, guild) }))
        .map((entry) => obj.roles.cache.get(entry.role)!)
        .filter((role) => role);

    const forceEntries = await db.query.forcedStaff.findMany({
        columns: { user: true, staff: true },
        where: eq(tables.forcedStaff.guild, guild),
    });

    const block = new Set(forceEntries.filter((entry) => !entry.staff).map((entry) => entry.user));
    const staff = new Set(forceEntries.filter((entry) => entry.staff).map((entry) => entry.user));

    for (const role of roles) for (const id of role.members.keys()) if (!block.has(id)) staff.add(id);

    const currentlyStaff = new Set(
        (await db.query.guildStaff.findMany({ columns: { user: true }, where: eq(tables.guildStaff.guild, guild) })).map((entry) => entry.user),
    );

    const add = [...staff].filter((id) => !currentlyStaff.has(id));
    const remove = [...currentlyStaff].filter((id) => !staff.has(id));

    if (add.length > 0) await db.insert(tables.guildStaff).values(add.map((id) => ({ guild, user: id })));
    if (remove.length > 0) await db.delete(tables.guildStaff).where(and(eq(tables.guildStaff.guild, guild), inArray(tables.guildStaff.user, remove)));

    if (process.env.VERBOSE) console.log(`Fixed staff for guild ${guild}. Added ${add.length} and removed ${remove.length} staff.`);
    await fixUserRolesQueue.addBulk([...add, ...remove].map((id) => ({ name: "", data: id })));
});

export async function updateAllGuildStaff() {
    await fixUserStaffStatusQueue.drain();
    await fixGuildStaffStatusQueue.drain();

    const entries = await db.query.guilds.findMany({ columns: { id: true } });
    await fixGuildStaffStatusQueue.addBulk(entries.map((entry) => ({ name: "", data: entry.id })));
}

loop("update-all-guild-staff", updateAllGuildStaff, 86400000);

bot.on(Events.GuildMemberUpdate, async (before, after) => {
    if (before.roles.cache.equals(after.roles.cache)) return;
    if (!(await db.query.guilds.findFirst({ columns: { id: true }, where: eq(tables.guilds.id, after.guild.id) }))) return;
    await fixUserStaffStatusQueue.add("", { guild: after.guild.id, user: after.id });
});
