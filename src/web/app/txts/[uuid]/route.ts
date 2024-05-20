"use server";

import { api } from "../../../lib/trpc";

export async function GET({ url }: Request) {
    const uuid = new URL(url).pathname.slice(6, 42);
    const data = await api.getTxt.query(uuid);
    if (!data) return new Response("404 File Not Found", { status: 404 });
    return new Response(data, { headers: { "Content-Type": "text/plain" } });
}
