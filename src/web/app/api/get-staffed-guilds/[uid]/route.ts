"use server";

import getUser from "@/lib/get-user";
import { api } from "@/lib/trpc";

export async function GET({ url }: Request) {
    const user = await getUser();
    if (!user?.staff) return new Response(null, { status: 403 });

    const uid = new URL(url).pathname.slice(24);
    if (!/^[1-9][0-9]{16,19}$/.test(uid)) return new Response(null);
    return new Response(JSON.stringify(await api.checkStaff.query(uid)));
}
