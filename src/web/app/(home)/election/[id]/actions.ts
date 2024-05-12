"use server";

import { api } from "../../../../lib/trpc";

export async function submitElectionVote(token: string, ranked: string[], countered: string[]) {
    return await api.submitElectionVote.mutate({ token, ranked, countered });
}
