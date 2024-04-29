"use server";

import { trpc } from "../../../lib/trpc";

export async function GET({ url }: Request) {
    const key = url.split("/banlist/")[1].slice(0, 36);
    const content = await trpc.getBanlist.query(key);

    if (!content) return new Response("NOT FOUND", { status: 404 });
    return new Response(content, { status: 200 });
}
