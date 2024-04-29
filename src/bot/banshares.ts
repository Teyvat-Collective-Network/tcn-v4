import { BaseMessageOptions, ButtonStyle, ComponentType } from "discord.js";
import { api } from "./api.js";
import bot, { channels } from "./bot.js";

export async function triggerBanshareReminder() {
    const banshares = await api.getPendingBanshares.query();
    if (!banshares.some(({ urgent, reminded }) => Date.now() - reminded > (urgent ? 7200000 : 21600000))) return;

    await channels.execManagement.send({
        content: `<@&${process.env.ROLE_OBSERVERS}> A banshare has exceeded the allowed pending time. Here is a list of all pending banshares:\n${banshares
            .map(({ message }) => `- ${channels.banshareLogs.url}/${message}`)
            .join("\n")}`,
        allowedMentions: { roles: [process.env.ROLE_OBSERVERS!] },
    });

    await api.remindPendingBanshares.mutate(banshares.map((banshare) => banshare.message));
}

export function banshareComponents(
    severity: string,
    locked: boolean,
    state: "pending" | "published" | "rejected" | "rescinded",
): BaseMessageOptions["components"] {
    if (state === "pending")
        return [
            {
                type: ComponentType.ActionRow,
                components: [
                    {
                        type: ComponentType.StringSelect,
                        customId: "banshare-action",
                        options: [
                            locked
                                ? [{ value: "unlock", label: "Unlock Banshare", emoji: "🔓" }]
                                : [
                                      { value: "lock", label: "Lock Banshare", emoji: "🔒" },
                                      { value: "publish", label: "Publish & Ban from Global Chat", emoji: "✅" },
                                      { value: "publish-no-global", label: "Publish", emoji: "☑️" },
                                      { value: "reject", label: "Reject", emoji: "❌" },
                                  ],
                            severity === "P0" ? [] : { value: "set-P0", label: "Set to P0", emoji: "🟥" },
                            severity === "P1" ? [] : { value: "set-P1", label: "Set to P1", emoji: "🟨" },
                            severity === "P2" ? [] : { value: "set-P2", label: "Set to P2", emoji: "🟦" },
                            severity === "DM" ? [] : { value: "set-DM", label: "Set to DM", emoji: "⬛" },
                        ].flat(),
                        minValues: 0,
                        maxValues: 1,
                    },
                ],
            },
        ];

    if (state === "published")
        return [
            {
                type: ComponentType.ActionRow,
                components: [{ type: ComponentType.Button, customId: "banshare-rescind", style: ButtonStyle.Danger, label: "Rescind" }],
            },
        ];

    if (state === "rejected")
        return [
            {
                type: ComponentType.ActionRow,
                components: [{ type: ComponentType.Button, customId: ".", style: ButtonStyle.Danger, label: "Rejected", disabled: true }],
            },
        ];

    if (state === "rescinded")
        return [
            {
                type: ComponentType.ActionRow,
                components: [{ type: ComponentType.Button, customId: ".", style: ButtonStyle.Danger, label: "Rescinded", disabled: true }],
            },
        ];
}

export async function updateBanshareDashboard(banshares?: { message: string }[]) {
    banshares ??= await api.getPendingBanshares.query();

    try {
        const message = (await channels.banshareDashboard.messages.fetch({ limit: 1 })).first();

        const text =
            banshares.length === 0
                ? "No pending banshares at this time."
                : `The following banshares are pending:\n\n${banshares.map((banshare) => `- ${channels.banshareLogs.url}/${banshare.message}`).join("\n")}`;

        if (message?.author.id === bot.user.id) await message.edit(text);
        else await channels.banshareDashboard.send(text);
    } catch (e) {
        channels.logs.send(`An error occurred updating the banshare dashboard: ${e}`);
    }
}
