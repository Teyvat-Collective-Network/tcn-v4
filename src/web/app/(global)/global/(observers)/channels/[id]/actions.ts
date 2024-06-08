"use server";

import { api } from "../../../../../../lib/trpc";

export async function getGlobalChannel(id: number) {
    return await api.getGlobalChannel.query(id);
}

export async function getGlobalConnectionDetails(id: string) {
    return await api.getGlobalConnectionDetails.query(id);
}
