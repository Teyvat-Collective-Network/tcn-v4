import { channels } from "../../bot.js";
import { db } from "../../db/db.js";
import { loop } from "../../lib/loop.js";
import { trackMetrics } from "../../lib/metrics.js";

loop(
    "stat-channels",
    async function () {
        await trackMetrics("stat-channels", async () => {
            const guilds = await db.query.guilds.findMany({ columns: { owner: true, advisor: true } });
            const members = new Set(guilds.flatMap((g) => [g.owner, ...(g.advisor ? [g.advisor] : [])]));

            await channels.statsMembers.setName(`Members: ${members.size}`);
            await channels.statsServers.setName(`Servers: ${guilds.length}`);
            await channels.statsQuorum60.setName(`60% Quorum: ${Math.ceil(guilds.length * 0.6)} / ${guilds.length}`);
            await channels.statsQuorum75.setName(`75% Quorum: ${Math.ceil(guilds.length * 0.75)} / ${guilds.length}`);
        });
    },
    600000,
);
