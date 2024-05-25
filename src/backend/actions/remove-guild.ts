import { eq } from "drizzle-orm";
import { z } from "zod";
import { HQ, HUB } from "../bot.js";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { syncPartnerLists } from "../modules/autosync/index.js";
import { fixUserRolesQueue } from "../queue.js";
import { proc } from "../trpc.js";

export default proc
    .input(z.object({ actor: zs.snowflake, id: zs.snowflake }))
    .output(z.string().nullable())
    .mutation(
        trpcify(async ({ actor, id }) => {
            const guild = await db.query.guilds.findFirst({
                columns: { name: true, owner: true, advisor: true, hqRole: true, hubRole: true },
                where: eq(tables.guilds.id, id),
            });

            const staff = await db.query.guildStaff.findMany({ columns: { user: true }, where: eq(tables.guildStaff.guild, id) });

            if (!guild) return "Guild not found.";

            try {
                const role = await HQ.roles.fetch(guild.hqRole);
                await role?.delete();
            } catch {}

            try {
                const role = await HUB.roles.fetch(guild.hubRole);
                await role?.delete();
            } catch {}

            await db.delete(tables.guilds).where(eq(tables.guilds.id, id));

            await fixUserRolesQueue.addBulk(
                [...new Set([guild.owner, guild.advisor || [], staff.map((entry) => entry.user)].flat())].map((id) => ({ name: "", data: id })),
            );

            await audit(actor, "guilds/delete", id, { name: guild.name, owner: guild.owner, advisor: guild.advisor });

            syncPartnerLists();

            return null;
        }),
    );
