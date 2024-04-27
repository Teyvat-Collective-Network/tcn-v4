"use server";

import { bot } from "./trpc";

export async function getTag(id: string) {
    return await bot.getTag.query(id);
}
