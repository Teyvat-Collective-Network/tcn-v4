import { count, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import trpcify from "../lib/trpcify.js";
import {
    fixGuildRolesQueue,
    fixGuildStaffStatusQueue,
    fixUserRolesQueue,
    fixUserStaffStatusQueue,
    globalChatRelayQueue,
    reportPublishQueue,
    reportRescindQueue,
} from "../queue.js";
import { proc } from "../trpc.js";

const start = Date.now();

const globalTasks: number[] = new Array(60).fill(0);
const roleUpdates: number[] = new Array(60).fill(0);
const staffUpdates: number[] = new Array(60).fill(0);
const reportUpdates: number[] = new Array(60).fill(0);

function update(list: number[], value: number) {
    list.push(value);
    while (list.length > 60) list.shift();
}

setInterval(async () => {
    update(globalTasks, await globalChatRelayQueue.count());
    update(roleUpdates, (await fixUserRolesQueue.count()) + (await fixGuildRolesQueue.count()));
    update(staffUpdates, (await fixUserStaffStatusQueue.count()) + (await fixGuildStaffStatusQueue.count()));
    update(
        reportUpdates,
        (await reportPublishQueue.count()) +
            (await db.select({ number: count() }).from(tables.reportTasks).where(eq(tables.reportTasks.status, "pending")))[0].number +
            (await reportRescindQueue.count()),
    );
}, 5000);

export default proc.query(
    trpcify("api:get-monitor", async () => {
        return {
            upSince: start,
            globalTasks,
            roleUpdates,
            staffUpdates,
            reportUpdates,
        };
    }),
);
