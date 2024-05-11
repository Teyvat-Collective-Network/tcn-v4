import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(zs.snowflake)
    .output(
        z.object({
            observer: z.boolean(),
            observerSince: z.number().int().min(0),
            globalNickname: z.string().max(40).nullable(),
            owns: zs.snowflakes,
            advises: zs.snowflakes,
            staffs: zs.snowflakes,
        }),
    )
    .query(
        trpcify(async (id) => {
            const base = (await db.query.users.findFirst({ where: eq(tables.users.id, id) })) ?? { observer: false, observerSince: 0, globalNickname: null };

            const guilds = await db.query.guilds.findMany({
                columns: { id: true, owner: true, advisor: true },
                where: or(eq(tables.guilds.owner, id), eq(tables.guilds.advisor, id)),
            });

            const staffs = await db.query.guildStaff.findMany({ columns: { guild: true }, where: eq(tables.guildStaff.user, id) });

            return {
                ...base,
                owns: guilds.filter((guild) => guild.owner === id).map((guild) => guild.id),
                advises: guilds.filter((guild) => guild.advisor === id).map((guild) => guild.id),
                staffs: staffs.map((entry) => entry.guild).filter((id) => !guilds.some((guild) => guild.id === id)),
            };
        }),
    );
