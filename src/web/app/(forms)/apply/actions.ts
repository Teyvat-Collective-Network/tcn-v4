"use server";

import { getId } from "../../../lib/get-user";
import { api } from "../../../lib/trpc";

export async function getInvite(invite: string) {
    return await api.getInvite.query(invite);
}

export async function submitApplication(invite: string, experience: string, goals: string, history: string, additional: string) {
    if (experience.length > 1024 || goals.length > 1024 || history.length > 1024 || additional.length > 1024)
        return "Responses must not exceed 1024 characters per field. You are welcome to include a link if you need to exceed this limit.";

    if (!goals.trim() || !history.trim()) return "The server goals and server history sections are required.";

    const user = await getId();
    if (!user) return "You seem to have been logged out. Please copy your results and try refreshing the page or log in in a new tag.";

    return await api.submitApplication.mutate({ user, invite, experience, goals, history, additional });
}
