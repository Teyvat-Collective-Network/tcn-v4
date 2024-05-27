import { eq } from "drizzle-orm";
import { z } from "zod";
import bot from "../bot.js";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { audit } from "../lib/audit.js";
import { validateInvite } from "../lib/bot-lib.js";
import trpcify from "../lib/trpcify.js";
import zs from "../lib/zs.js";
import { syncPartnerLists } from "../modules/autosync/index.js";
import { fixGuildRolesQueue } from "../queue.js";
import { proc } from "../trpc.js";

export default proc
    .input(
        z.object({
            actor: zs.snowflake,
            id: zs.snowflake,
            mascot: zs.id,
            name: z.string().trim().min(1).max(80),
            invite: z.string(),
            owner: zs.snowflake,
            advisor: zs.snowflake.nullable(),
            delegated: z.boolean(),
            roleColor: z.number().int().min(0).max(0xffffff),
            roleName: z.string().trim().min(1).max(80),
        }),
    )
    .output(z.string().nullable())
    .query(
        trpcify("api:add-guild", async ({ actor, id, mascot, name, invite, owner, advisor, delegated, roleColor, roleName }) => {
            const data = await bot.fetchInvite(invite).catch(() => null);

            if (!!(await db.query.guilds.findFirst({ where: eq(tables.guilds.id, id) }))) return "This guild is already in the network.";

            const error = await validateInvite(data, id);
            if (error) return error;

            try {
                await db.insert(tables.guilds).values({
                    id,
                    mascot,
                    name,
                    invite,
                    owner,
                    advisor,
                    delegated,
                    image: data!.guild!.iconURL({ extension: "png", forceStatic: true, size: 256 }) ?? `${process.env.DOMAIN}/favicon.png`,
                    roleColor,
                    roleName,
                    hqRole: "not initialized",
                    hubRole: "not initialized",
                });

                await audit(actor, "guilds/create", id, { mascot, name, invite, owner, advisor, delegated, roleColor, roleName });

                await fixGuildRolesQueue.add("", id);
                syncPartnerLists();
            } catch {
                return "An unexpected error occurred. This guild may have just been added to the network by another observer.";
            }

            return null;
        }),
    );
