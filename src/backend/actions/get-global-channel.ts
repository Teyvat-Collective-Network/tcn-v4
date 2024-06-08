import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import { proc } from "../trpc.js";

export default proc.input(z.number().int().min(1)).query(
    trpcify("api:get-global-channel", async (id) => {
        const channel = await db.query.globalChannels.findFirst({ columns: { name: true }, where: eq(tables.globalChannels.id, id) });

        const connections =
            channel === undefined
                ? []
                : await db
                      .select({ guild: tables.globalConnections.guild, guildName: tables.guilds.name, location: tables.globalConnections.location })
                      .from(tables.globalConnections)
                      .leftJoin(tables.guilds, eq(tables.globalConnections.guild, tables.guilds.id))
                      .where(eq(tables.globalConnections.channel, id));

        return { channel, connections };
    }),
);
