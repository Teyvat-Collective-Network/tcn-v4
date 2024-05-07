"use server";

import { api } from "../../../../../lib/trpc";

export async function addGuild(
    id: string,
    mascot: string,
    name: string,
    invite: string,
    owner: string,
    advisor: string | null,
    delegated: boolean,
    roleColor: number,
    roleName: string,
) {
    return await api.addGuild.query({ id, mascot, name, invite, owner, advisor, delegated, roleColor, roleName });
}
