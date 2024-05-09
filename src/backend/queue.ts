import { Queue, Worker } from "bullmq";

export const qoptions = {
    connection: { host: process.env.REDIS_HOST, port: +process.env.REDIS_PORT! },
    defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
} as const;

export type DMReminderTask = { id: number; url: string; user: string };
export type BansharePublishTask = { id: number; guild: string };
export type BanshareRescindTask = { id: number; guild: string; channel: string; message: string; explanation: string };

export const dmReminderQueue = new Queue<DMReminderTask>("tcn:dm-reminders", qoptions);
export const repostDeletedApplicationThreadsQueue = new Queue("tcn:repost-deleted-application-threads", qoptions);
export const repostDeletedOpenPollsQueue = new Queue("tcn:repost-deleted-open-polls", qoptions);
export const fixGuildRolesQueue = new Queue<string>("tcn:fix-guild-roles", qoptions);
export const fixUserRolesQueue = new Queue<string>("tcn:fix-user-roles", qoptions);
export const bansharePublishQueue = new Queue<BansharePublishTask>("tcn:banshare-publish", qoptions);
export const banshareActionQueue = new Queue<null>("tcn:banshare-action", qoptions);
export const banshareRescindQueue = new Queue<BanshareRescindTask>("tcn:banshare-rescind", qoptions);

export function makeWorker<T>(name: string, handler: (data: T) => unknown) {
    new Worker<T>(
        name,
        async ({ data }) => {
            try {
                await handler(data);
            } catch (error) {
                console.error(`Error in worker for queue ${name}. Data was ${JSON.stringify(data)}`);
                console.error(error);
            }
        },
        qoptions,
    );
}
