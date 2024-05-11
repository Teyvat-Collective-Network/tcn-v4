"use server";

import { api } from "../../../../../lib/trpc";
import { withUserId } from "../../../../../lib/with-user";

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
    return await withUserId(async (actor) => await api.addGuild.query({ actor, id, mascot, name, invite, owner, advisor, delegated, roleColor, roleName }));
}
