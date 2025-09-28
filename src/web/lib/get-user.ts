"use server";

import { cookies, headers } from "next/headers";
import { api } from "./trpc";
import { User } from "./types";

export async function getToken(): Promise<string | undefined> {
    return cookies().get("discord_access_token")?.value;
}

export async function getId(token?: string): Promise<string | null> {
    const auth = headers().get("Authorization");

    if (auth?.startsWith("Bearer"))
        try {
            const jwt = auth.slice(7);
            const user = await api.validateApiKey.query(jwt);
            if (user) return user;
        } catch {}

    token ??= await getToken();
    if (!token) return null;

    let id: string | undefined;

    if (token) {
        const userReq = await fetch(`${process.env.DISCORD_API}/users/@me`, { headers: { Authorization: `Bearer ${token}` } });
        const userRes = await userReq.json();

        if (userRes.id) id = userRes.id;
    }

    return id ?? null;
}

export default async function getUser(token?: string): Promise<User | null> {
    const id = await getId(token);
    if (id === null) return null;

    return await api.getUser.query(id);
}
