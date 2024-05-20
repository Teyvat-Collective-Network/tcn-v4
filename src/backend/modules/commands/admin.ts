import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { updateReportsDashboard } from "../../lib/reports.js";
import { cmdKey, ensureObserver, template } from "../../lib/bot-lib.js";
import { repostDeletedApplicationThreadsQueue, repostDeletedOpenPollsQueue } from "../../queue.js";
import { fixAllGuildRoles, fixAllUserRoles } from "../rolesync/index.js";
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
                        { name: "Update All User Roles", value: "update-all-user-roles" },
                        { name: "Synchronize All Staff", value: "synchronize-all-staff" },
                    ],
                },
            ],
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
            case "update-all-user-roles":
                fixAllUserRoles();
                break;
            case "synchronize-all-staff":
                updateAllGuildStaff();
                break;
            default:
                throw "Unknown task.";
        }

        await interaction.editReply(template.ok("Task has been queued in the background."));
    }
}
