import {
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
import { isCouncil } from "./api-lib.js";

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
    const user = await db.query.users.findFirst({ columns: { observer: true }, where: eq(tables.users.id, interaction.user.id) });
    if (!user?.observer) throw "Permission denied: you must be an observer.";
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
    const valid = await isCouncil(interaction.user.id);
    if (!valid) throw "Permission denied: you must be a voter.";
}

export async function ensureTCN(interaction: RepliableInteraction) {
    if (!interaction.guild) throw "This command can only be used in a server.";
    if (!(await db.query.guilds.findFirst({ columns: { id: true }, where: eq(tables.guilds.id, interaction.guild.id) })))
        throw "This command is restricted to TCN servers.";
}

export function cmdKey(interaction: ChatInputCommandInteraction) {
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
