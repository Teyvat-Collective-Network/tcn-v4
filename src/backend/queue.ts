import { Queue } from "bullmq";

export const qoptions = {
    connection: { host: process.env.REDIS_HOST, port: +process.env.REDIS_PORT! },
    defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
} as const;

export type DMReminderTask = { id: number; url: string; user: string };

export const dmReminderQueue = new Queue<DMReminderTask>("tcn:dm-reminders", qoptions);
