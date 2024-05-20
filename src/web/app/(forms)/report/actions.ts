"use server";

import { getId } from "../../../lib/get-user";
import { api } from "../../../lib/trpc";

export async function submitReport(ids: string, reason: string, evidence: string, server: string, category: string, urgent: boolean) {
    const author = await getId();
    if (!author) return "You seem to be logged out. Please reload the page.";

    return await api.submitReport.mutate({ author, ids, reason, evidence, server, category: category as any, urgent });
}

export async function submitQuiz(answers: string[]) {
    const user = await getId();
    if (!user) return "You seem to be logged out. Please reload the page.";

    return await api.submitQuiz.mutate({ user, answers });
}
