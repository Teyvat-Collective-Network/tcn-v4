import { Queue } from "bullmq";

export const qoptions = {
    connection: { host: process.env.REDIS_HOST, port: +process.env.REDIS_PORT! },
    defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
} as const;

export type DMReminderTask = { id: number; url: string; user: string };

export const dmReminderQueue = new Queue<DMReminderTask>("tcn:dm-reminders", qoptions);
export const repostDeletedApplicationThreadsQueue = new Queue("tcn:repost-deleted-application-threads", qoptions);
export const repostDeletedOpenPollsQueue = new Queue("tcn:repost-deleted-open-polls", qoptions);
export const fixGuildRolesQueue = new Queue<string>("tcn:fix-guild-roles", qoptions);
export const fixUserRolesQueue = new Queue<string>("tcn:fix-user-roles", qoptions);
