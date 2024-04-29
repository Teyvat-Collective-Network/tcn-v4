"use server";

import { getId } from "../../../lib/get-user";
import { bot } from "../../../lib/trpc";

export async function submitBanshare(obj: {
    ids: string;
    reason: string;
    evidence: string;
    server: string;
    severity: string;
    urgent: boolean;
    validate: boolean;
}) {
    const user = await getId();

    if (!user)
        return ["You seem to be logged out. Please log in again and submit the form again (your progress will be lost, so copy-paste it out first).", false];

    return await bot.submitBanshare.mutate({ ...obj, user });
}
