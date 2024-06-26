"use server";

import getUser from "../../../lib/get-user";
import { api } from "../../../lib/trpc";

const anonymize = ["reports/update/severity", "reports/unlock", "reports/reject", "reports/restore", "reports/publish", "reports/rescind"];

const publicTypes = [
    ...anonymize,
    "guilds/create",
    "guilds/delete",
    "guilds/update/owner",
    "guilds/update/advisor",
    "guilds/update/swap-representatives",
    "guilds/update/delegated",
    "guilds/update/invite",
    "guilds/update/mascot",
    "guilds/update/name",
    "applications/vote",
    "applications/rename",
    "applications/nuke",
    "polls/reset-deadline",
    "polls/delete",
    "polls/update/add-preapprove",
    "polls/update/remove-preapprove",
    "users/promote",
    "users/demote",
    "users/refresh-term",
];

export async function getAuditLogs(
    actor: string | null,
    type: string | null,
    guild: string | null,
    target: string | null,
    offset: number,
    limit: number,
): Promise<{ pages: number; entries: { time: number; actor: string; type: string; guild: string | null; data?: any }[] }> {
    const user = await getUser();
    if (!user?.council) return { pages: 1, entries: [] };

    const data = await api.getAuditLogs.query({
        actor,
        types: type && (user.observer || publicTypes.includes(type)) ? [type] : user.observer ? null : publicTypes,
        guild,
        target,
        offset,
        limit,
    });

    if (user.observer) return data;

    return { pages: data.pages, entries: data.entries.map((item) => (anonymize.includes(item.type) ? { ...item, actor: "hidden" } : item)) };
}
