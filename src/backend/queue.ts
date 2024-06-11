import { Queue, Worker } from "bullmq";
import { trackMetrics } from "./lib/metrics.js";

export const qoptions = {
    connection: { host: process.env.REDIS_HOST, port: +process.env.REDIS_PORT! },
    defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
} as const;

export type DMReminderTask = { id: number; url: string; user: string };
export type ReportPublishTask = { id: number; guild: string };
export type ReportRescindTask = { id: number; guild: string; channel: string; message: string; explanation: string };
export type FixUserStaffStatusTask = { guild: string; user: string };

export type GlobalChatRelayTask =
    | { type: "post"; id: number; locations: { guild: string; location: string }[] }
    | { type: "start-delete"; objects: { ref: number; guild: string; channel: string; message: string }[] }
    | { type: "delete"; guild: string; channel: string; messages: string[] }
    | { type: "start-edit"; ref: number; guild: string; channel: string; message: string; content?: string; embeds?: any; attachments: any }
    | { type: "edit"; ref: number; guild: string; channel: string; message: string }
    | { type: "start-info-on-user"; ref: number };

export const queues = new Map<string, Queue<unknown>>();

function createQueue<T>(name: string) {
    const queue = new Queue<T>(name, qoptions);
    queues.set(name, queue);
    return queue;
}

export const dmReminderQueue = createQueue<DMReminderTask>("tcn:dm-reminders");
export const repostDeletedApplicationThreadsQueue = createQueue("tcn:repost-deleted-application-threads");
export const repostDeletedOpenPollsQueue = createQueue("tcn:repost-deleted-open-polls");
export const fixGuildRolesQueue = createQueue<string>("tcn:fix-guild-roles");
export const fixUserRolesQueue = createQueue<string>("tcn:fix-user-roles");
export const fixUserStaffStatusQueue = createQueue<FixUserStaffStatusTask>("tcn:fix-user-staff-status");
export const fixGuildStaffStatusQueue = createQueue<string>("tcn:fix-guild-staff-status");
export const reportPublishQueue = createQueue<ReportPublishTask>("tcn:report-publish");
export const reportActionQueue = createQueue<null>("tcn:report-action");
export const reportRescindQueue = createQueue<ReportRescindTask>("tcn:report-rescind");
export const globalChatRelayQueue = createQueue<GlobalChatRelayTask>("tcn:global-chat-relay");

export function makeWorker<T>(name: string, handler: (data: T) => unknown) {
    new Worker<T>(
        name,
        async ({ data }) => {
            await trackMetrics(`worker:${name}`, async () => {
                try {
                    if (process.env.LOG_WORKERS)
                        console.log(`Running worker for queue ${name}. Data is ${JSON.stringify(data)}. Remaining: ${await queues.get(name)?.count()}.`);
                    await handler(data);
                } catch (error) {
                    console.error(`Error in worker for queue ${name}. Data was ${JSON.stringify(data)}`);
                    console.error(error);
                }
            });
        },
        qoptions,
    );
}

export enum GlobalChatTaskPriority {
    Delete = 1,
    Edit,
    PostHighPriority,
    PostMediumPriority,
    PostLowPriority,
}
