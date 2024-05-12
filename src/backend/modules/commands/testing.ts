import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { cmdKey, template } from "../../lib/bot-lib.js";
import { fixUserRolesQueue } from "../../queue.js";

export default process.env.TESTING
    ? ([
          {
              type: ApplicationCommandType.ChatInput,
              name: "testing",
              description: "testing commands",
              options: [
                  {
                      type: ApplicationCommandOptionType.Subcommand,
                      name: "make-me-staff",
                      description: "promote yourself to staff everywhere",
                  },
                  {
                      type: ApplicationCommandOptionType.Subcommand,
                      name: "remove-me-from-staff",
                      description: "remove yourself from staff everywhere",
                  },
                  {
                      type: ApplicationCommandOptionType.Subcommand,
                      name: "promote-me",
                      description: "make yourself observer",
                  },
                  {
                      type: ApplicationCommandOptionType.Subcommand,
                      name: "demote-me",
                      description: "remove yourself from observer",
                  },
              ],
          },
      ] satisfies ApplicationCommandDataResolvable[])
    : [];

export async function handleTesting(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const key = cmdKey(interaction);

    if (key === "make-me-staff") {
        const guilds = await db.query.guilds.findMany({ columns: { id: true } });

        await db
            .insert(tables.guildStaff)
            .values(guilds.map((guild) => ({ guild: guild.id, user: interaction.user.id })))
            .onDuplicateKeyUpdate({ set: { user: interaction.user.id } });

        await interaction.editReply(template.ok(`Made you staff in ${guilds} server${guilds.length === 1 ? "" : "s"}.`));
        await fixUserRolesQueue.add("", interaction.user.id);
    } else if (key === "remove-me-from-staff") {
        const [{ affectedRows }] = await db.delete(tables.guildStaff).where(eq(tables.guildStaff.user, interaction.user.id));
        await interaction.editReply(template.ok(`Removed you from staff in ${affectedRows} server${affectedRows === 1 ? "" : "s"}.`));
        await fixUserRolesQueue.add("", interaction.user.id);
    } else if (key === "promote-me") {
        await db
            .insert(tables.users)
            .values({ id: interaction.user.id, observer: true })
            .onDuplicateKeyUpdate({ set: { observer: true } });

        await interaction.editReply(template.ok("Promoted you to observer."));
        await fixUserRolesQueue.add("", interaction.user.id);
    } else if (key === "demote-me") {
        await db
            .insert(tables.users)
            .values({ id: interaction.user.id, observer: false })
            .onDuplicateKeyUpdate({ set: { observer: false } });

        await interaction.editReply(template.ok("Demoted you from observer."));
        await fixUserRolesQueue.add("", interaction.user.id);
    }
}
