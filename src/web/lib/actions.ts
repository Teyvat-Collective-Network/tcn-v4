"use server";

import { api } from "./trpc";

export async function getTag(id: string) {
    return (await api.getTag.query(id)) ?? `Unknown User ${id}`;
}
