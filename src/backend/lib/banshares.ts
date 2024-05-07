import { BaseMessageOptions, ButtonComponentData, ButtonStyle, ComponentType } from "discord.js";
import { eq, or } from "drizzle-orm";
import bot, { channels } from "../bot.js";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { greyButton, template } from "./bot-lib.js";

export const severities = { P0: "P0", P1: "P1", P2: "P2", DM: "DM Scam" } as const;

export async function renderHQBanshare(id: number) {
    return { embeds: await renderBanshare(id), components: await renderBanshareControls(id) };
}

export async function renderBanshare(id: number): Promise<BaseMessageOptions["embeds"]> {
    const banshare = await db.query.banshares.findFirst({ where: eq(tables.banshares.id, id) });
    if (!banshare) return template.error(`Could not fetch banshare with ID ${id}.`).embeds!;

    const guild = await db.query.guilds.findFirst({ columns: { name: true }, where: eq(tables.guilds.id, banshare.server) });

    return [
        {
            title: "Banshare",
            color: 0x2b2d31,
            fields: [
                { name: "ID(s)", value: banshare.display },
                banshare.usernames ? { name: "Username(s)", value: banshare.usernames } : [],
                { name: "Reason", value: banshare.reason },
                { name: "Evidence", value: banshare.evidence },
                {
                    name: "Submitted By",
                    value: `<@${banshare.author}> (${(await bot.users.fetch(banshare.author).catch(() => null))?.tag ?? "?"}) from ${
                        guild?.name ?? `[unknown guild: \`${banshare.server}\`]`
                    }`,
                },
                banshare.status === "rejected" ? [] : { name: "Severity", value: severities[banshare.severity] ?? "[invalid severity]" },
            ].flat(),
        },
    ];
}

export async function renderBanshareControls(id: number): Promise<BaseMessageOptions["components"]> {
    const banshare = await db.query.banshares.findFirst({ where: eq(tables.banshares.id, id) });
    if (!banshare) return greyButton("Failed to Fetch Banshare").components;

    if (banshare.status === "pending")
        return [
            {
                type: ComponentType.ActionRow,
                components: [
                    { type: ComponentType.Button, customId: ":banshares/lock", style: ButtonStyle.Danger, label: "Lock", emoji: "🔒" },
                    { type: ComponentType.Button, customId: ":banshares/publish", style: ButtonStyle.Success, label: "Publish" },
                    { type: ComponentType.Button, customId: ":banshares/reject", style: ButtonStyle.Danger, label: "Reject" },
                ],
            },
            {
                type: ComponentType.ActionRow,
                components: (
                    [
                        ["P0", ButtonStyle.Danger],
                        ["P1", ButtonStyle.Primary],
                        ["P2", ButtonStyle.Success],
                        ["DM", ButtonStyle.Secondary],
                    ] as const
                ).map(([severity, style]) => ({
                    type: ComponentType.Button,
                    customId: `:banshares/change-severity:${severity}`,
                    style,
                    label: severity,
                    disabled: banshare.severity === severity,
                })),
            },
        ];

    if (banshare.status === "locked")
        return [
            {
                type: ComponentType.ActionRow,
                components: [
                    {
                        type: ComponentType.Button,
                        customId: ":banshares/unlock",
                        style: ButtonStyle.Success,
                        label: "Unlock",
                        emoji: "🔓",
                    },
                    ...(
                        [
                            ["P0", ButtonStyle.Danger],
                            ["P1", ButtonStyle.Primary],
                            ["P2", ButtonStyle.Success],
                            ["DM", ButtonStyle.Secondary],
                        ] as const
                    ).map<ButtonComponentData>(([severity, style]) => ({
                        type: ComponentType.Button,
                        customId: `:banshares/change-severity:${severity}`,
                        style,
                        label: severity,
                        disabled: banshare.severity === severity,
                    })),
                ],
            },
        ];

    if (banshare.status === "rejected") return greyButton("Rejected", ButtonStyle.Danger).components;

    if (banshare.status === "published")
        return [
            {
                type: ComponentType.ActionRow,
                components: [{ type: ComponentType.Button, customId: ":banshares/rescind", style: ButtonStyle.Danger, label: "Rescind" }],
            },
        ];

    if (banshare.status === "rescinded") return greyButton("Rescinded", ButtonStyle.Danger).components;
}

export async function updateBanshareDashboard() {
    const messages = await channels.banshareDashboard.messages.fetch({ limit: 1 }).catch(() => null);

    const banshares = await db.query.banshares.findMany({
        columns: { message: true },
        where: or(eq(tables.banshares.status, "pending"), eq(tables.banshares.status, "locked")),
    });

    const text =
        banshares.length === 0
            ? "No pending banshares at this time."
            : `The following banshares are pending:\n${banshares.map((banshare) => `${channels.banshareDashboard.url}/${banshare.message}`).join("\n")}`;

    if (messages)
        try {
            await messages.first()!.edit(text);
            return;
        } catch {}

    messages?.first()?.delete();
    await channels.banshareDashboard.send(text);
}
