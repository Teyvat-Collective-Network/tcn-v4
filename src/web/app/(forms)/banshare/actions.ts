"use server";

import { getId } from "../../../lib/get-user";
import { api } from "../../../lib/trpc";

export async function submitBanshare(ids: string, reason: string, evidence: string, server: string, severity: string, urgent: boolean) {
    const author = await getId();
    if (!author) return "You seem to be logged out. Please reload the page.";

    return await api.submitBanshare.mutate({ author, ids, reason, evidence, server, severity, urgent });
}
