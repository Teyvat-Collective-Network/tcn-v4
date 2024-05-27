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

const roleUpdates: number[] = [];
const staffUpdates: number[] = [];
const reportUpdates: number[] = [];
const globalTasks: number[] = [];

let counter = 0;

function update(list: number[], value: number) {
    if (counter === 0) list.push(value);
    else list[list.length - 1] = Math.max(list[list.length - 1], value);
    while (list.length > 60) list.shift();
}

setInterval(async () => {
    update(roleUpdates, (await fixUserRolesQueue.count()) + (await fixGuildRolesQueue.count()));
    update(staffUpdates, (await fixUserStaffStatusQueue.count()) + (await fixGuildStaffStatusQueue.count()));
    update(
        reportUpdates,
        (await reportPublishQueue.count()) +
            (await db.select({ number: count() }).from(tables.reportTasks).where(eq(tables.reportTasks.status, "pending")))[0].number +
            (await reportRescindQueue.count()),
    );
    update(globalTasks, await globalChatRelayQueue.count());

    counter = (counter + 1) % 10;
}, 500);

export default proc.query(
    trpcify(async () => {
        return {
            upSince: start,
            roleUpdates,
            staffUpdates,
            reportUpdates,
            globalTasks,
        };
    }),
);
