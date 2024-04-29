import { and, eq, inArray, isNotNull, isNull, not } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { proc } from "../trpc.js";
export default {
    createBanlist: proc
        .input(z.string())
        .output(z.string())
        .mutation(async ({ input }) => {
            return await db.transaction(async (tx) => {
                let key: string;

                do {
                    key = crypto.randomUUID();
                } while (await tx.query.banlists.findFirst({ columns: { key: true }, where: eq(tables.banlists.key, key) }));

                await tx.insert(tables.banlists).values({ key, content: input });

                return `${process.env.DOMAIN}/banlist/${key}`;
            });
        }),
    getBanlist: proc
        .input(z.string())
        .output(z.string().nullable())
        .query(async ({ input: key }) => {
            const banlist = await db.query.banlists.findFirst({ columns: { content: true }, where: eq(tables.banlists.key, key) });
            return banlist?.content ?? null;
        }),
    submitBanshare: proc
        .input(
            z.object({
                message: z.string(),
                ids: z.string().array(),
                reason: z.string(),
                evidence: z.string(),
                author: z.string(),
                guild: z.string(),
                severity: z.string(),
                urgent: z.boolean(),
                idDisplay: z.string(),
                usernameDisplay: z.string().nullable(),
            }),
        )
        .mutation(async ({ input: { ids, ...banshare } }) => {
            await db.transaction(async (tx) => {
                await tx.insert(tables.banshares).values({ ...banshare, status: "pending", created: Date.now(), reminded: Date.now(), locked: false });
                await tx.insert(tables.banshareIds).values(ids.map((id) => ({ message: banshare.message, user: id })));
            });
        }),
    getPendingBanshares: proc.query(async () => {
        return await db.query.banshares.findMany({ columns: { message: true, reminded: true, urgent: true }, where: eq(tables.banshares.status, "pending") });
    }),
    getPendingBansharesFull: proc.query(async () => {
        return await db.query.banshares.findMany({ where: eq(tables.banshares.status, "pending") });
    }),
    setBanshareMessage: proc.input(z.object({ original: z.string(), updated: z.string() })).mutation(async ({ input: { original, updated } }) => {
        await db.update(tables.banshares).set({ message: updated }).where(eq(tables.banshares.message, original));
    }),
    remindPendingBanshares: proc.input(z.string().array()).mutation(async ({ input: ids }) => {
        await db.update(tables.banshares).set({ reminded: Date.now() }).where(inArray(tables.banshares.message, ids));
    }),
    lockBanshare: proc
        .input(z.string())
        .output(z.boolean())
        .mutation(async ({ input: message }) => {
            const [{ affectedRows }] = await db
                .update(tables.banshares)
                .set({ locked: true })
                .where(and(eq(tables.banshares.message, message), eq(tables.banshares.status, "pending"), eq(tables.banshares.locked, false)));

            return affectedRows > 0;
        }),
    unlockBanshare: proc
        .input(z.string())
        .output(z.boolean())
        .mutation(async ({ input: message }) => {
            const [{ affectedRows }] = await db
                .update(tables.banshares)
                .set({ locked: false })
                .where(and(eq(tables.banshares.message, message), eq(tables.banshares.locked, true)));

            return affectedRows > 0;
        }),
    setBanshareSeverity: proc
        .input(z.object({ message: z.string(), severity: z.string() }))
        .output(z.boolean())
        .mutation(async ({ input: { message, severity } }) => {
            const [{ affectedRows }] = await db
                .update(tables.banshares)
                .set({ severity })
                .where(and(eq(tables.banshares.message, message), eq(tables.banshares.status, "pending"), not(eq(tables.banshares.severity, severity))));

            return affectedRows > 0;
        }),
    getBanshareIds: proc
        .input(z.string())
        .output(z.string().array())
        .query(async ({ input: message }) => {
            const entries = await db.query.banshareIds.findMany({ columns: { user: true }, where: eq(tables.banshareIds.message, message) });
            return entries.map((entry) => entry.user);
        }),
    rejectBanshare: proc
        .input(z.string())
        .output(z.boolean())
        .mutation(async ({ input: message }) => {
            const [{ affectedRows }] = await db
                .update(tables.banshares)
                .set({ status: "rejected" })
                .where(and(eq(tables.banshares.message, message), eq(tables.banshares.status, "pending")));

            return affectedRows > 0;
        }),
    publishBanshare: proc
        .input(z.string())
        .output(z.boolean())
        .mutation(async ({ input: message }) => {
            const [{ affectedRows }] = await db
                .update(tables.banshares)
                .set({ status: "published" })
                .where(and(eq(tables.banshares.message, message), eq(tables.banshares.status, "pending")));

            if (affectedRows > 0)
                await db.transaction(async (tx) => {
                    const entries = await tx.query.banshareSettings.findMany({ columns: { guild: true }, where: isNotNull(tables.banshareSettings.channel) });
                    await tx.insert(tables.pendingBanshareCrossposts).values(entries.map((entry) => ({ message, guild: entry.guild })));
                });

            return affectedRows > 0;
        }),
    rescindBanshare: proc
        .input(z.string())
        .output(z.boolean())
        .mutation(async ({ input: message }) => {
            const [{ affectedRows }] = await db
                .update(tables.banshares)
                .set({ status: "rescinded" })
                .where(and(eq(tables.banshares.message, message), eq(tables.banshares.status, "published")));

            if (affectedRows === 0) return false;

            await db.delete(tables.pendingBanshareCrossposts).where(eq(tables.pendingBanshareCrossposts.message, message));
            await db.update(tables.banTasks).set({ status: "skipped" }).where(eq(tables.banTasks.message, message));

            const tasks = await db.selectDistinct({ guild: tables.banTasks.guild }).from(tables.banTasks).where(eq(tables.banTasks.message, message));

            if (tasks.length > 0) await db.insert(tables.rescindedBanshareLogTasks).values(tasks.map((task) => ({ guild: task.guild, message })));

            return true;
        }),
    getBanshareCrossposts: proc.input(z.string()).query(async ({ input: message }) => {
        return await db
            .select({ channel: tables.banshareSettings.channel, originChannel: tables.banshareCrossposts.channel, message: tables.banshareCrossposts.location })
            .from(tables.banshareCrossposts)
            .innerJoin(tables.banshareSettings, eq(tables.banshareCrossposts.guild, tables.banshareSettings.guild))
            .where(and(eq(tables.banshareCrossposts.message, message), isNotNull(tables.banshareSettings.channel)));
    }),
    setBanshareHubPost: proc.input(z.object({ message: z.string(), hubPost: z.string() })).mutation(async ({ input: { message, hubPost } }) => {
        await db.update(tables.banshares).set({ hubPost }).where(eq(tables.banshares.message, message));
    }),
    getBanshareHubPost: proc.input(z.string()).query(async ({ input: message }) => {
        const post = await db.query.banshares.findFirst({ columns: { hubPost: true }, where: eq(tables.banshares.message, message) });
        return post?.hubPost ?? null;
    }),
    getOneBanshareCrosspostTask: proc.query(async () => {
        const tasks = await db
            .select({
                id: tables.pendingBanshareCrossposts.id,
                message: tables.pendingBanshareCrossposts.message,
                guild: tables.banshareSettings.guild,
                name: tables.guilds.name,
                channel: tables.banshareSettings.channel,
                autoban: tables.banshareSettings.autoban,
                idDisplay: tables.banshares.idDisplay,
                usernameDisplay: tables.banshares.usernameDisplay,
                reason: tables.banshares.reason,
                evidence: tables.banshares.evidence,
                author: tables.banshares.author,
                origin: tables.banshares.guild,
                severity: tables.banshares.severity,
            })
            .from(tables.pendingBanshareCrossposts)
            .innerJoin(tables.banshareSettings, eq(tables.pendingBanshareCrossposts.guild, tables.banshareSettings.guild))
            .innerJoin(tables.banshares, eq(tables.pendingBanshareCrossposts.message, tables.banshares.message))
            .innerJoin(tables.guilds, eq(tables.pendingBanshareCrossposts.guild, tables.guilds.id))
            .limit(1);

        if (tasks.length === 0) return null;

        const entries = await db.query.banshareIds.findMany({ columns: { user: true }, where: eq(tables.banshareIds.message, tasks[0].message) });

        return { ...tasks[0], ids: entries.map((entry) => entry.user) };
    }),
    addBanTasks: proc
        .input(z.object({ guild: z.string(), message: z.string(), users: z.string().array(), member: z.boolean().nullable() }))
        .mutation(async ({ input: { guild, message, users, member } }) => {
            await db.insert(tables.banTasks).values(users.map((user) => ({ guild, message, user, member, status: "pending" as const })));
        }),
    completeBanshareCrosspostTask: proc
        .input(z.object({ id: z.number().int().min(1), origin: z.string(), guild: z.string(), channel: z.string().nullable(), message: z.string().nullable() }))
        .mutation(async ({ input: { id, origin, guild, channel, message } }) => {
            await db.delete(tables.pendingBanshareCrossposts).where(eq(tables.pendingBanshareCrossposts.id, id));
            if (channel && message) await db.insert(tables.banshareCrossposts).values({ guild, message: origin, channel, location: message });
        }),
    executeBanshare: proc
        .input(z.object({ guild: z.string(), message: z.string(), executor: z.string() }))
        .output(z.boolean())
        .mutation(async ({ input: { guild, message, executor } }) => {
            const [{ affectedRows }] = await db
                .update(tables.banshareCrossposts)
                .set({ executor })
                .where(
                    and(
                        eq(tables.banshareCrossposts.guild, guild),
                        eq(tables.banshareCrossposts.location, message),
                        isNull(tables.banshareCrossposts.executor),
                    ),
                );

            if (affectedRows > 0)
                await db.transaction(async (tx) => {
                    const entries = await db
                        .select({ message: tables.banshareCrossposts.message, user: tables.banshareIds.user })
                        .from(tables.banshareCrossposts)
                        .innerJoin(tables.banshareIds, eq(tables.banshareCrossposts.message, tables.banshareIds.message))
                        .where(and(eq(tables.banshareCrossposts.guild, guild), eq(tables.banshareCrossposts.location, message)));

                    await db
                        .insert(tables.banTasks)
                        .values(entries.map((entry) => ({ guild, message: entry.message, user: entry.user, status: "pending" as const })));
                });

            return affectedRows > 0;
        }),
    getOneBanTask: proc.query(async () => {
        const tasks = await db
            .select({
                id: tables.banTasks.id,
                guild: tables.banTasks.guild,
                message: tables.banTasks.message,
                user: tables.banTasks.user,
                member: tables.banTasks.member,
                reason: tables.banshares.reason,
                channel: tables.banshareCrossposts.channel,
                location: tables.banshareCrossposts.location,
                daedalus: tables.banshareSettings.daedalus,
            })
            .from(tables.banTasks)
            .innerJoin(tables.banshares, eq(tables.banTasks.message, tables.banshares.message))
            .innerJoin(
                tables.banshareCrossposts,
                and(eq(tables.banTasks.guild, tables.banshareCrossposts.guild), eq(tables.banTasks.message, tables.banshareCrossposts.message)),
            )
            .innerJoin(tables.banshareSettings, eq(tables.banTasks.guild, tables.banshareSettings.guild))
            .where(eq(tables.banTasks.status, "pending"))
            .limit(1);

        return tasks.at(0);
    }),
    completeBanTask: proc
        .input(z.object({ id: z.number().int().min(1), status: z.enum(["banned", "skipped", "errored"]) }))
        .mutation(async ({ input: { id, status } }) => {
            await db.update(tables.banTasks).set({ status }).where(eq(tables.banTasks.id, id));
        }),
    getAllBanTasksIfAllDone: proc.input(z.object({ guild: z.string(), message: z.string() })).query(async ({ input: { guild, message } }) => {
        const tasks = await db.query.banTasks.findMany({
            columns: { status: true, user: true },
            where: and(eq(tables.banTasks.guild, guild), eq(tables.banTasks.message, message)),
        });

        if (tasks.every((task) => task.status !== "pending")) {
            await db.delete(tables.banTasks).where(and(eq(tables.banTasks.guild, guild), eq(tables.banTasks.message, message)));

            return {
                tasks,
                details: await db.query.banshareCrossposts.findFirst({
                    columns: { channel: true, location: true, executor: true },
                    where: and(eq(tables.banshareCrossposts.guild, guild), eq(tables.banshareCrossposts.message, message)),
                }),
            };
        }

        return { tasks: null, details: null };
    }),
    getOneRescindedBanshareLogTask: proc.query(async () => {
        return await db.query.rescindedBanshareLogTasks.findFirst();
    }),
    completeRescindedBanshareLogTask: proc.input(z.number().int().min(1)).mutation(async ({ input: id }) => {
        await db.delete(tables.rescindedBanshareLogTasks).where(eq(tables.rescindedBanshareLogTasks.id, id));
    }),
};
