import {
    AutocompleteInteraction,
    BaseMessageOptions,
    ButtonStyle,
    ChatInputCommandInteraction,
    Colors,
    ComponentType,
    InteractionReplyOptions,
    Invite,
    RepliableInteraction,
} from "discord.js";
import { and, eq, or } from "drizzle-orm";
import bot from "../bot.js";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { isCouncil, isObserver } from "./api-lib.js";

export function embed(title: string, description: string, color: number, ephemeral: boolean = true): BaseMessageOptions & { ephemeral: boolean } {
    return { content: "", embeds: [{ title, description, color }], files: [], components: [], ephemeral };
}

export const template = {
    ok: (body: string, ephemeral?: boolean) => embed("OK!", body, Colors.Green, ephemeral),
    error: (body: string, ephemeral?: boolean) => embed("Error!", body, Colors.Red, ephemeral),
    info: (body: string, ephemeral?: boolean) => embed("Info", body, Colors.Blue, ephemeral),
    warning: (body: string, ephemeral?: boolean) => embed("Warning", body, Colors.Gold, ephemeral),
};

export async function validateInvite(invite: string | Invite | null, guild?: string) {
    const data = typeof invite === "string" ? await bot.fetchInvite(invite).catch(() => null) : invite;

    if (!data) return "Invalid invite!";
    if (!data.guild) return "That invite does not point to a server. Make sure you haven't entered a group DM invite.";
    if (guild && data.guild.id !== guild) return "That invite points to the wrong server.";
    if (!!data.expiresAt) return "That invite is not permanent. Please generate an invite that will not expire.";
    if (data.code === data.guild.vanityURLCode) return "That invite is the server's vanity URL. Please generate a permanent invite that isn't the vanity.";

    return null;
}

export async function reply(interaction: RepliableInteraction, data: InteractionReplyOptions) {
    if (interaction.replied) return await interaction.followUp(data);
    else if (interaction.deferred) return await interaction.editReply(data);
    else return await interaction.reply(data);
}

export async function ensureObserver(interaction: RepliableInteraction) {
    if (!(await isObserver(interaction.user.id))) throw "Permission denied: you must be an observer.";
}

export async function ensureVoter(interaction: RepliableInteraction) {
    const valid = !!(await db.query.guilds.findFirst({
        columns: { id: true },
        where: or(
            and(eq(tables.guilds.delegated, true), eq(tables.guilds.advisor, interaction.user.id)),
            and(eq(tables.guilds.delegated, false), eq(tables.guilds.owner, interaction.user.id)),
        ),
    }));

    if (!valid) throw "Permission denied: you must be a voter.";
}

export async function ensureCouncil(interaction: RepliableInteraction) {
    if (!(await isCouncil(interaction.user.id))) throw "Permission denied: you must be a voter.";
}

export async function ensureTCN(interaction: RepliableInteraction) {
    if (!interaction.guild) throw "This command can only be used in a server.";
    if (!(await db.query.guilds.findFirst({ columns: { id: true }, where: eq(tables.guilds.id, interaction.guild.id) })))
        throw "This command is restricted to TCN servers.";
}

export function cmdKey(interaction: ChatInputCommandInteraction | AutocompleteInteraction) {
    const group = interaction.options.getSubcommandGroup(false);
    const sub = interaction.options.getSubcommand(false);

    return group ? `${group}/${sub}` : sub ? `${sub}` : "";
}

export function greyButton(label: string, style: Exclude<ButtonStyle, ButtonStyle.Link> = ButtonStyle.Secondary): BaseMessageOptions {
    return {
        components: [
            {
                type: ComponentType.ActionRow,
                components: [{ type: ComponentType.Button, customId: ".", style, label, disabled: true }],
            },
        ],
    };
}

export async function promptConfirm(interaction: RepliableInteraction, body: string, timeout: number = 300) {
    const message = await reply(interaction, {
        embeds: [
            {
                title: "Confirm?",
                description: body,
                color: 0x2b2d31,
                footer: {
                    text: `You have ${
                        timeout < 60
                            ? `${timeout} second${timeout === 1 ? "" : "s"}`
                            : timeout % 60 === 0
                            ? `${timeout / 60} minute${timeout === 60 ? "" : "s"}`
                            : `${Math.floor(timeout / 60)} minute${timeout < 120 ? "" : "s"} and ${timeout % 60} second${timeout % 60 === 1 ? "" : "s"}`
                    } to confirm.`,
                },
            },
        ],
        components: [
            {
                type: ComponentType.ActionRow,
                components: [
                    { type: ComponentType.Button, customId: "confirm", style: ButtonStyle.Success, label: "Confirm" },
                    { type: ComponentType.Button, customId: "cancel", style: ButtonStyle.Danger, label: "Cancel" },
                ],
            },
        ],
        ephemeral: true,
        fetchReply: true,
    });

    const button = await message
        .awaitMessageComponent({ componentType: ComponentType.Button, filter: (button) => button.user === interaction.user, time: timeout * 1000 })
        .catch(() => null);

    if (!button) {
        message.edit(greyButton("Timed Out"));
        throw null;
    }

    if (button.customId === "cancel") {
        button.update(greyButton("Canceled"));
        throw null;
    }

    return button;
}

export async function displayPartnerList(excludeHub: boolean): Promise<BaseMessageOptions> {
    const guilds = await db
        .select({
            mascot: tables.characters.id,
            short: tables.characters.short,
            long: tables.characters.name,
            element: tables.characters.element,
            name: tables.guilds.name,
            invite: tables.guilds.invite,
        })
        .from(tables.guilds)
        .innerJoin(tables.characters, eq(tables.guilds.mascot, tables.characters.id));

    const count = new Map<string, number>();
    for (const { mascot } of guilds) count.set(mascot, (count.get(mascot) ?? 0) + 1);

    const links = Object.fromEntries(["pyro", "hydro", "anemo", "electro", "dendro", "cryo", "geo"].map<[string, string[]]>((element) => [element, []]));

    for (const { mascot, short, long, element, name, invite } of guilds)
        links[element].push(`- [${(count.get(mascot) ?? 0) > 1 ? name : short ?? long}](https://discord.gg/${invite})`);

    const groups = Object.entries(links)
        .sort(([, a], [, b]) => b.length - a.length)
        .map<[string, string]>(([element, list]) => [element, list.sort().join("\n")]);

    const fields = groups.map(([element, list]) => ({ name: process.env[`EMOJI_ELEMENT_${element.toUpperCase()}`]!, value: list || "_ _", inline: true }));

    while (fields.length % 3 !== 0) fields.push({ name: "_ _", value: "_ _", inline: true });

    return {
        embeds: [
            {
                color: 0x2b2d31,
                image: { url: "https://imgur.com/sDdOtLU.png" },
            },
            {
                title: "Teyvat Collective Network",
                color: 0x2b2d31,
                fields: [
                    ...fields,
                    ...(excludeHub
                        ? []
                        : [
                              {
                                  name: "TCN Hub",
                                  value: `Join us in the official TCN Hub to ask questions, talk to other members, get info and updates, and contact our observers (admins)! ${process.env.HUB_INVITE}`,
                              },
                          ]),
                    {
                        name: "Genshin Wizard",
                        value: "The TCN is partnered with [Genshin Wizard](https://genshinwizard.com/), a multi-purpose Genshin Discord bot with a wide array of features to let you view your in-game stats, flex your builds, view build guides and hundreds of high-quality infographics, and more!",
                    },
                    {
                        name: "Genshin Impact Tavern",
                        value: "The TCN is partnered with the [Genshin Impact Tavern](https://discord.gg/genshinimpacttavern), an official community server for Genshin! Check out their RPG-like experience where you can redeem official merch, their Cat's Tail Gathering TCG tournament, and more!",
                    },
                    {
                        name: "Daedalus",
                        value: "The TCN is partnered with [Daedalus](https://daedalusbot.xyz), a general-purpose Discord bot that offers a high-quality server management experience. TCN servers get free access to custom clients. Check out the website for more information!",
                    },
                ],
                image: { url: "https://i.imgur.com/U9Wqlug.png" },
            },
        ],
    };
}

export async function getHubAndNormalPartnerList(): Promise<[BaseMessageOptions, BaseMessageOptions]> {
    const base = await displayPartnerList(false);

    return [
        {
            ...base,
            embeds: base.embeds?.map((embed) =>
                "toJSON" in embed
                    ? { ...embed.toJSON(), fields: embed.toJSON().fields?.filter(({ name }) => name !== "TCN Hub") }
                    : { ...embed, fields: embed.fields?.filter(({ name }) => name !== "TCN Hub") },
            ),
        },
        base,
    ];
}
