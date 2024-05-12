"use server";

import { getId } from "../../../lib/get-user";
import { api } from "../../../lib/trpc";
import BanshareFormClient from "./client";

export default async function BanshareForm() {
    const user = await getId();
    if (!user) return;

    return <BanshareFormClient guilds={await api.getGuildsForBanshare.query(user)} />;
}
