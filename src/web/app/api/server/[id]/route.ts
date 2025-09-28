"use server";

import { api } from "@/lib/trpc";

export async function GET({ url }: Request) {
    const id = new URL(url).pathname.slice(12);
    if (!/^[1-9][0-9]{16,19}$/.test(id)) return new Response(null, { status: 404 });

    const guild = await api.getGuild.query(id);
    if (!guild) return new Response(null, { status: 404 });

    return new Response(
        JSON.stringify({
            id: guild.id,
            mascot: guild.mascot,
            name: guild.name,
            invite: guild.invite,
            owner: guild.owner,
            advisor: guild.advisor,
        }),
    );
}
