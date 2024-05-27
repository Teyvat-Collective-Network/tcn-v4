import { Queue, Worker } from "bullmq";

export const qoptions = {
    connection: { host: process.env.REDIS_HOST, port: +process.env.REDIS_PORT! },
    defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
} as const;

export type DMReminderTask = { id: number; url: string; user: string };
export type ReportPublishTask = { id: number; guild: string };
export type ReportRescindTask = { id: number; guild: string; channel: string; message: string; explanation: string };
export type FixUserStaffStatusTask = { guild: string; user: string };

export type GlobalChatRelayTask =
    | { type: "post"; id: number; guild: string; channel: string }
    | { type: "start-delete"; objects: { ref: number; guild: string; channel: string; message: string }[] }
    | { type: "delete"; guild: string; channel: string; messages: string[] }
    | { type: "start-edit"; ref: number; guild: string; channel: string; message: string; content?: string; embeds?: any; attachments: any }
    | { type: "edit"; ref: number; guild: string; channel: string; message: string }
    | { type: "start-info-on-user"; ref: number };

export const dmReminderQueue = new Queue<DMReminderTask>("tcn:dm-reminders", qoptions);
export const repostDeletedApplicationThreadsQueue = new Queue("tcn:repost-deleted-application-threads", qoptions);
export const repostDeletedOpenPollsQueue = new Queue("tcn:repost-deleted-open-polls", qoptions);
export const fixGuildRolesQueue = new Queue<string>("tcn:fix-guild-roles", qoptions);
export const fixUserRolesQueue = new Queue<string>("tcn:fix-user-roles", qoptions);
export const fixUserStaffStatusQueue = new Queue<FixUserStaffStatusTask>("tcn:fix-user-staff-status", qoptions);
export const fixGuildStaffStatusQueue = new Queue<string>("tcn:fix-guild-staff-status", qoptions);
export const reportPublishQueue = new Queue<ReportPublishTask>("tcn:report-publish", qoptions);
export const reportActionQueue = new Queue<null>("tcn:report-action", qoptions);
export const reportRescindQueue = new Queue<ReportRescindTask>("tcn:report-rescind", qoptions);
export const globalChatRelayQueue = new Queue<GlobalChatRelayTask>("tcn:global-chat-relay", qoptions);

export function makeWorker<T>(name: string, handler: (data: T) => unknown) {
    new Worker<T>(
        name,
        async ({ data }) => {
            try {
                if (process.env.LOG_WORKERS) console.log(`Running worker for queue ${name}. Data is ${JSON.stringify(data)}.`);
                await handler(data);
            } catch (error) {
                console.error(`Error in worker for queue ${name}. Data was ${JSON.stringify(data)}`);
                console.error(error);
            }
        },
        qoptions,
    );
}

export enum GlobalChatTaskPriority {
    Delete = 1,
    Edit,
    Post,
}
