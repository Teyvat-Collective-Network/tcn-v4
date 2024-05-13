import { db } from "../db/db.js";
import trpcify from "../lib/trpcify.js";
import { proc } from "../trpc.js";

export default proc.query(
    trpcify(async () => {
        const channels = await db.query.globalChannels.findMany({ columns: { id: true, name: true, visible: true, password: true, protected: true } });
        return channels.map(({ password, ...channel }) => ({ ...channel, hasPassword: password !== null }));
    }),
);
