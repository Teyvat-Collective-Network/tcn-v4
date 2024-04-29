import { and, eq, or } from "drizzle-orm";
import z from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { proc } from "../trpc.js";

export default {
    getBasicUserInfo: proc
        .input(z.string())
        .output(z.object({ staff: z.boolean(), globalMod: z.boolean(), council: z.boolean(), advisor: z.boolean(), owner: z.boolean(), observer: z.boolean() }))
        .query(async ({ input: id }) => {
            const user = await db.query.users.findFirst({
                columns: { staff: true, globalMod: true, advisor: true, owner: true, observer: true },
                where: eq(tables.users.id, id),
            });

            if (!user) return { staff: false, globalMod: false, council: false, advisor: false, owner: false, observer: false };

            return { ...user, council: user.owner || user.advisor };
        }),
    getUserStaffedServers: proc
        .input(z.string())
        .output(z.object({ id: z.string(), name: z.string() }).array())
        .query(async ({ input: id }) => {
            return await db
                .select({ id: tables.guilds.id, name: tables.guilds.name })
                .from(tables.guilds)
                .leftJoin(tables.guildStaff, eq(tables.guilds.id, tables.guildStaff.guild))
                .where(or(eq(tables.guilds.owner, id), eq(tables.guilds.advisor, id), eq(tables.guildStaff.user, id)));
        }),
    validateBansharePermission: proc
        .input(z.object({ user: z.string(), guild: z.string() }))
        .output(z.boolean())
        .query(async ({ input: { user, guild } }) => {
            const server = await db.query.guilds.findFirst({ columns: { owner: true, advisor: true }, where: eq(tables.guilds.id, guild) });
            if (!server) return false;

            if (server.owner === user || server.advisor === user) return true;

            return !!(await db.query.guildStaff.findFirst({ where: and(eq(tables.guildStaff.guild, guild), eq(tables.guildStaff.user, user)) }));
        }),
    isObserver: proc
        .input(z.string())
        .output(z.boolean())
        .query(async ({ input: id }) => {
            const user = await db.query.users.findFirst({ columns: { observer: true }, where: eq(tables.users.id, id) });
            return !!user?.observer;
        }),
};
