import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { cmdKey, ensureObserver, template } from "../../lib/bot-lib.js";
import { updateReportsDashboard } from "../../lib/reports.js";
import {
    dmReminderQueue,
    fixGuildRolesQueue,
    fixGuildStaffStatusQueue,
    fixUserRolesQueue,
    fixUserStaffStatusQueue,
    globalChatRelayQueue,
    queues,
    reportActionQueue,
    reportPublishQueue,
    reportRescindQueue,
    repostDeletedApplicationThreadsQueue,
    repostDeletedOpenPollsQueue,
} from "../../queue.js";
import { fixAllGuildRoles } from "../rolesync/index.js";
import { updateAllGuildStaff } from "../staffsync/index.js";

export default {
    type: ApplicationCommandType.ChatInput,
    name: "admin",
    description: "admin commands",
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "run",
            description: "run a task manually",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "task",
                    description: "task to run",
                    required: true,
                    choices: [
                        { name: "Repost Deleted Application Threads", value: "repost-deleted-application-threads" },
                        { name: "Update Report Dashboard", value: "update-report-dashboard" },
                        { name: "Repost Deleted Open Polls", value: "repost-deleted-open-polls" },
                        { name: "Fix Missing Guild Roles", value: "fix-missing-guild-roles" },
                        { name: "Synchronize All Staff", value: "synchronize-all-staff" },
                    ],
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "obliterate-queues",
            description: "obliterate all task queues",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "confirm",
                    description: "type 'confirm' to obliterate all task queues",
                    required: true,
                    minLength: 7,
                    maxLength: 7,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "check-queues",
            description: "check the queue sizes",
        },
    ],
} satisfies ApplicationCommandDataResolvable;

export async function handleAdmin(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    await ensureObserver(interaction);

    const key = cmdKey(interaction);

    if (key === "run") {
        switch (interaction.options.getString("task", true)) {
            case "repost-deleted-application-threads":
                await repostDeletedApplicationThreadsQueue.add("", null);
                break;
            case "update-report-dashboard":
                updateReportsDashboard();
                break;
            case "repost-deleted-open-polls":
                repostDeletedOpenPollsQueue.add("", null);
                break;
            case "fix-missing-guild-roles":
                fixAllGuildRoles();
                break;
            case "synchronize-all-staff":
                updateAllGuildStaff();
                break;
            default:
                throw "Unknown task.";
        }

        await interaction.editReply(template.ok("Task has been queued in the background."));
    } else if (key === "obliterate-queues") {
        if (interaction.options.getString("confirm", true) !== "confirm") throw "Confirmation string does not match.";

        await Promise.all([
            dmReminderQueue.drain(),
            repostDeletedApplicationThreadsQueue.drain(),
            repostDeletedOpenPollsQueue.drain(),
            fixGuildRolesQueue.drain(),
            fixUserRolesQueue.drain(),
            fixUserStaffStatusQueue.drain(),
            fixGuildStaffStatusQueue.drain(),
            reportPublishQueue.drain(),
            reportActionQueue.drain(),
            reportRescindQueue.drain(),
            globalChatRelayQueue.drain(),
        ]);

        await interaction.editReply(template.ok("All task queues have been obliterated."));
    } else if (key === "check-queues") {
        await interaction.editReply(
            template.info((await Promise.all([...queues.entries()].map(async ([name, queue]) => `\`${name}\`: ${await queue.count()}`))).join("\n")),
        );
    }
}
