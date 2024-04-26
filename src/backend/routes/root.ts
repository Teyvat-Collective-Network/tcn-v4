import { count } from "drizzle-orm";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { proc } from "../trpc.js";

export default {
    getServerCount: proc.query(async () => {
        const [{ number }] = await db.select({ number: count() }).from(tables.guilds);
        return number;
    }),
    getPartnerList: proc.query(async () => {
        return await db.query.guilds.findMany({ columns: { id: true, mascot: true, name: true, invite: true, image: true } });
    }),
};
