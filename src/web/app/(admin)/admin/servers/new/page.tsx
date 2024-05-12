"use server";

import { api } from "../../../../../lib/trpc";
import AdminServersNewClient from "./client";

export default async function AdminServersNew({ searchParams: { origin } }: { searchParams: { origin?: string } }) {
    const characters = await api.getCharacters.query();

    if (origin) {
        const data = await api.getPartialGuildFromThread.query(origin).catch(() => null);
        if (!data) return <AdminServersNewClient characters={characters} />;

        return <AdminServersNewClient id={data.guild} name={data.name} invite={data.invite} characters={characters} />;
    } else return <AdminServersNewClient characters={characters} />;
}
