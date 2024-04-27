"use server";

import { getId } from "../../../lib/get-user";
import { bot } from "../../../lib/trpc";

export async function submitApplication(obj: { invite: string; experience: string; goals: string; history: string; additional: string }) {
    const user = await getId();

    if (!user)
        return ["You seem to be logged out. Please log in again and submit the form again (your progress will be lost, so copy-paste it out first).", false];

    return await bot.submitApplication.mutate({ ...obj, user });
}
