"use server";

import { api } from "../../../lib/trpc";

export async function GET({ url }: Request) {
    const uuid = new URL(url).pathname.slice(6, 42);
    const goto = await api.getFile.query(uuid);
    if (!goto) return new Response("404 File Not Found", { status: 404 });
    return new Response(null, { headers: { Location: goto }, status: 302 });
}
