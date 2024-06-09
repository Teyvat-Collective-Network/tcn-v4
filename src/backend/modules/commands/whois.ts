import {
    ApplicationCommandDataResolvable,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
} from "discord.js";
import { and, eq, notInArray, or } from "drizzle-orm";
import { db } from "../../db/db.js";
import tables from "../../db/tables.js";
import { fuzzy } from "../../lib.js";
import { cmdKey, template } from "../../lib/bot-lib.js";

export default {
    type: ApplicationCommandType.ChatInput,
    name: "whois",
    description: "identify a user in the TCN",
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "user",
            description: "identify a user in the TCN",
            options: [
                {
                    type: ApplicationCommandOptionType.User,
                    name: "user",
                    description: "the user to identify",
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "owner",
            description: "identify the owner of a TCN server",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "server",
                    description: "the server",
                    required: true,
                    autocomplete: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "advisor",
            description: "identify the council advisor of a TCN server",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "server",
                    description: "the server",
                    required: true,
                    autocomplete: true,
                },
            ],
        },
    ],
} satisfies ApplicationCommandDataResolvable;

export async function autocompleteServer(interaction: AutocompleteInteraction) {
    const query = interaction.options.getFocused();

    const guilds = await db.query.guilds.findMany({ columns: { id: true, name: true } });

    await interaction.respond(
        guilds
            .filter((guild) => fuzzy(guild.name, query))
            .slice(0, 25)
            .map((guild) => ({ name: guild.name, value: guild.id })),
    );
}

export async function handleWhois(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const key = cmdKey(interaction);

    if (key === "user") {
        const user = interaction.options.getUser("user", true).id;

        const guilds = await db.query.guilds.findMany({
            columns: { id: true, name: true, owner: true, advisor: true },
            where: or(eq(tables.guilds.owner, user), eq(tables.guilds.advisor, user)),
        });

        const owns = guilds.filter((guild) => guild.owner === user);
        const advises = guilds.filter((guild) => guild.advisor === user);

        const staffPositions = await db
            .select({ id: tables.guildStaff.guild, name: tables.guilds.name })
            .from(tables.guildStaff)
            .innerJoin(tables.guilds, eq(tables.guildStaff.guild, tables.guilds.id))
            .where(
                guilds.length === 0
                    ? eq(tables.guildStaff.user, user)
                    : and(
                          eq(tables.guildStaff.user, user),
                          notInArray(
                              tables.guildStaff.guild,
                              guilds.map((guild) => guild.id),
                          ),
                      ),
            );

        await interaction.editReply(
            template.info(
                guilds.length === 0 && staffPositions.length === 0
                    ? "This user is not associated with any TCN servers."
                    : [
                          owns.length === 0 ? null : `- owns ${owns.map((x) => x.name).join(", ")}`,
                          advises.length === 0 ? null : `- advises ${advises.map((x) => x.name).join(", ")}`,
                          staffPositions.length === 0 ? null : `- holds staff positions in ${staffPositions.map((x) => x.name).join(", ")}`,
                      ]
                          .filter((x) => x !== null)
                          .join("\n"),
            ),
        );
    } else if (key === "owner") {
        const id = interaction.options.getString("server", true);
        const guild = await db.query.guilds.findFirst({ columns: { name: true, owner: true }, where: eq(tables.guilds.id, id) });
        if (!guild) return void interaction.editReply(template.error("No server found with that ID."));
        await interaction.editReply(template.info(`The owner of ${guild.name} is <@${guild.owner}>.`));
    } else if (key === "advisor") {
        const id = interaction.options.getString("server", true);
        const guild = await db.query.guilds.findFirst({ columns: { name: true, advisor: true }, where: eq(tables.guilds.id, id) });
        if (!guild) return void interaction.editReply(template.error("No server found with that ID."));
        if (!guild.advisor) return void interaction.editReply(template.error(`${guild.name} does not have a council advisor.`));
        await interaction.editReply(template.info(`The council advisor of ${guild.name} is <@${guild.advisor}>.`));
    }
}
