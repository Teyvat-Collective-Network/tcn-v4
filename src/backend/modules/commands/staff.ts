import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { englishList } from "../../lib.js";
import { cmdKey, ensureObserver, ensureTCN, template } from "../../lib/bot-lib.js";
import { fixGuildStaffStatusQueue, fixUserRolesQueue, fixUserStaffStatusQueue } from "../../queue.js";

export default {
    type: ApplicationCommandType.ChatInput,
    name: "staff",
    description: "staff management commands",
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "add",
            description: "add a user to your server's staff team",
            options: [
                {
                    type: ApplicationCommandOptionType.User,
                    name: "user",
                    description: "the user to add",
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "remove",
            description: "remove a user from your server's staff team (overrides automatic assignment)",
            options: [
                {
                    type: ApplicationCommandOptionType.User,
                    name: "user",
                    description: "the user to remove",
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "reset",
            description: "reset a user's (or all users') staff status to automatic assignment",
            options: [
                {
                    type: ApplicationCommandOptionType.User,
                    name: "user",
                    description: "the user to reset (leave blank to reset all)",
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "list",
            description: "list your server's staff members",
        },
        {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: "roles",
            description: "manage staff roles",
            options: [
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "add",
                    description: "add a staff role for automatic assignment",
                    options: [
                        {
                            type: ApplicationCommandOptionType.Role,
                            name: "role",
                            description: "the role to add",
                            required: true,
                        },
                    ],
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "remove",
                    description: "remove a staff role from automatic assignment",
                    options: [
                        {
                            type: ApplicationCommandOptionType.Role,
                            name: "role",
                            description: "the role to remove",
                            required: true,
                        },
                    ],
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "list",
                    description: "list your server's staff roles",
                },
            ],
        },
    ],
} satisfies ApplicationCommandDataResolvable;

export async function handleStaff(interaction: ChatInputCommandInteraction) {
    await ensureTCN(interaction);
    if (!interaction.guild) return;

    if (interaction.user.id !== interaction.guild!.ownerId)
        await ensureObserver(interaction).catch(() => {
            throw "Only the server owner can manage staff members.";
        });

    await interaction.deferReply({ ephemeral: true });

    const key = cmdKey(interaction);

    if (key === "add") {
        const user = interaction.options.getUser("user", true).id;

        await db.insert(tables.guildStaff).values({ guild: interaction.guild.id, user }).onDuplicateKeyUpdate({ set: { user } });

        await db
            .insert(tables.forcedStaff)
            .values({ guild: interaction.guild.id, user, staff: true })
            .onDuplicateKeyUpdate({ set: { staff: true } });

        await interaction.editReply(template.ok(`<@${user}> has been added to your server's staff team and will remain even if they have no staff roles.`));

        await fixUserRolesQueue.add("", user);
    } else if (key === "remove") {
        const user = interaction.options.getUser("user", true).id;

        await db.delete(tables.guildStaff).where(and(eq(tables.guildStaff.guild, interaction.guild.id), eq(tables.guildStaff.user, user)));

        await db
            .insert(tables.forcedStaff)
            .values({ guild: interaction.guild.id, user, staff: false })
            .onDuplicateKeyUpdate({ set: { staff: false } });

        await interaction.editReply(
            template.ok(`<@${user}> has been removed from your server's staff team and will not be added even if they have staff roles.`),
        );

        await fixUserRolesQueue.add("", user);
    } else if (key === "reset") {
        const user = interaction.options.getUser("user", false)?.id;

        if (!user) await db.delete(tables.forcedStaff).where(eq(tables.forcedStaff.guild, interaction.guild.id));
        else await db.delete(tables.forcedStaff).where(and(eq(tables.forcedStaff.guild, interaction.guild.id), eq(tables.forcedStaff.user, user)));

        await interaction.editReply(template.ok(`${user ? `<@${user}>'s` : "All users'"} staff status has been reset to automatic assignment.`));

        if (user) await fixUserStaffStatusQueue.add("", { guild: interaction.guild.id, user });
        else await fixGuildStaffStatusQueue.add("", interaction.guild.id);
    } else if (key === "list") {
        const entries = await db.query.guildStaff.findMany({ columns: { user: true }, where: eq(tables.guildStaff.guild, interaction.guild.id) });
        if (entries.length === 0) return void interaction.editReply(template.info("There are no staff members in your server."));

        await interaction.editReply(template.info(`Staff members in your server: ${englishList(entries.map((entry) => `<@${entry.user}>`))}`));
    } else if (key === "roles/add") {
        const role = interaction.options.getRole("role", true).id;
        await db.insert(tables.autoStaffRoles).values({ guild: interaction.guild.id, role }).onDuplicateKeyUpdate({ set: { role } });

        await interaction.editReply(template.ok(`<@&${role}> has been added as a staff role for automatic assignment. Updates will occur in the background.`));

        await fixGuildStaffStatusQueue.add("", interaction.guild.id);
    } else if (key === "roles/remove") {
        const role = interaction.options.getRole("role", true).id;
        await db.delete(tables.autoStaffRoles).where(and(eq(tables.autoStaffRoles.guild, interaction.guild.id), eq(tables.autoStaffRoles.role, role)));

        await interaction.editReply(
            template.ok(`<@&${role}> has been removed from your server's staff roles for automatic assignment. Updates will occur in the background.`),
        );

        await fixGuildStaffStatusQueue.add("", interaction.guild.id);
    } else if (key === "roles/list") {
        const entries = await db.query.autoStaffRoles.findMany({ columns: { role: true }, where: eq(tables.autoStaffRoles.guild, interaction.guild.id) });
        if (entries.length === 0) return void interaction.editReply(template.info("There are no staff roles in your server."));

        await interaction.editReply(
            template.info(
                `Staff roles in your server: ${englishList(entries.map((entry) => interaction.guild!.roles.cache.get(entry.role)).filter((role) => role))}`,
            ),
        );
    }
}
