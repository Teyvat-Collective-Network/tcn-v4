"use server";

import getUser from "../../../../lib/get-user";
import { api } from "../../../../lib/trpc";

export async function getMonitor() {
    const user = await getUser();
    if (!user?.observer) throw null;

    return await api.getMonitor.query();
}
