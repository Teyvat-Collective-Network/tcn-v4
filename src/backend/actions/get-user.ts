import { eq, or } from "drizzle-orm";
import { z } from "zod";
import bot from "../bot.js";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { proc } from "../trpc.js";

export default proc
    .input(zs.snowflake)
    .output(
        z
            .object({
                id: z.string(),
                name: z.string(),
                tag: z.string(),
                image: z.string(),
                staff: z.boolean(),
                globalMod: z.boolean(),
                owner: z.boolean(),
                advisor: z.boolean(),
                council: z.boolean(),
                observer: z.boolean(),
            })
            .nullable(),
    )
    .query(
        trpcify("api:get-user", async (id) => {
            const user = await bot.users.fetch(id).catch(() => null);
            if (user === null) return null;

            const dbUser = await db.query.users.findFirst({ columns: { observer: true }, where: eq(tables.users.id, id) });

            const guilds = await db.query.guilds.findMany({
                columns: { owner: true, advisor: true },
                where: or(eq(tables.guilds.owner, id), eq(tables.guilds.advisor, id)),
            });

            const owner = guilds.some((guild) => guild.owner === id);
            const advisor = guilds.some((guild) => guild.advisor === id);
            const council = owner || advisor;
            const staff = council || !!(await db.query.guildStaff.findFirst({ where: eq(tables.guildStaff.user, id) }));
            const globalMod = dbUser?.observer || !!(await db.query.globalMods.findFirst({ where: eq(tables.globalMods.user, id) }));

            return {
                id,
                name: user.globalName ?? user.tag,
                tag: user.tag,
                image: user.displayAvatarURL({ extension: "png", forceStatic: true, size: 256 }),
                staff,
                globalMod,
                owner,
                advisor,
                council,
                observer: dbUser?.observer ?? false,
            };
        }),
    );
