import { db } from "../db/db.js";
import trpcify from "../lib/trpcify.js";
import { proc } from "../trpc.js";

export default proc.query(
    trpcify("api:get-global-channels", async () => {
        const channels = await db.query.globalChannels.findMany({
            columns: { id: true, name: true, visible: true, password: true, protected: true, logs: true },
        });

        const filters = await db.query.globalAppliedFilters.findMany();

        return channels.map(({ password, ...channel }) => ({
            ...channel,
            hasPassword: password !== null,
            filters: filters.filter((filter) => filter.channel === channel.id).map((filter) => filter.filter),
        }));
    }),
);
