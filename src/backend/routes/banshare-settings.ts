import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { proc } from "../trpc.js";

export default {
    setBanshareOutputChannel: proc.input(z.object({ guild: z.string(), channel: z.string() })).mutation(async ({ input: { guild, channel } }) => {
        await db.insert(tables.banshareSettings).values({ guild, channel }).onDuplicateKeyUpdate({ set: { guild } });
    }),
    clearBanshareOutputChannel: proc.input(z.string()).mutation(async ({ input: guild }) => {
        await db.update(tables.banshareSettings).set({ channel: null }).where(eq(tables.banshareSettings.guild, guild));
    }),
    addBanshareLogChannel: proc.input(z.object({ guild: z.string(), channel: z.string() })).mutation(async ({ input: { guild, channel } }) => {
        try {
            await db.insert(tables.banshareLogChannels).values({ guild, channel });
            return true;
        } catch {
            return false;
        }
    }),
    removeBanshareLogChannel: proc.input(z.object({ guild: z.string(), channel: z.string() })).mutation(async ({ input: { guild, channel } }) => {
        const [{ affectedRows }] = await db
            .delete(tables.banshareLogChannels)
            .where(and(eq(tables.banshareLogChannels.guild, guild), eq(tables.banshareLogChannels.channel, channel)));

        return affectedRows > 0;
    }),
    getBanshareOutputChannel: proc.input(z.string()).query(async ({ input: guild }) => {
        const entry = await db.query.banshareSettings.findFirst({ columns: { channel: true }, where: eq(tables.banshareSettings.guild, guild) });
        return entry?.channel ?? null;
    }),
    getBanshareLogChannels: proc.input(z.string()).query(async ({ input: guild }) => {
        const entries = await db.query.banshareLogChannels.findMany({ columns: { channel: true }, where: eq(tables.banshareLogChannels.guild, guild) });
        return entries.map((entry) => entry.channel);
    }),
    setDaedalusIntegration: proc.input(z.object({ guild: z.string(), enable: z.boolean() })).mutation(async ({ input: { guild, enable } }) => {
        await db
            .insert(tables.banshareSettings)
            .values({ guild, daedalus: enable })
            .onDuplicateKeyUpdate({ set: { daedalus: enable } });
    }),
    getAutobanMode: proc.input(z.string()).query(async ({ input: guild }) => {
        const entry = await db.query.banshareSettings.findFirst({ columns: { autoban: true }, where: eq(tables.banshareSettings.guild, guild) });
        if (!entry) return {};

        return entry.autoban ?? {};
    }),
    setAutobanMode: proc
        .input(z.object({ guild: z.string(), mode: z.record(z.tuple([z.boolean(), z.boolean()])) }))
        .mutation(async ({ input: { guild, mode } }) => {
            await db
                .insert(tables.banshareSettings)
                .values({ guild, autoban: mode })
                .onDuplicateKeyUpdate({ set: { autoban: mode } });
        }),
};
