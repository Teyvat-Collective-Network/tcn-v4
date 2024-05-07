"use server";

import { api } from "../../../../lib/trpc";

export async function getCharacters() {
    return await api.getCharacters.query();
}

export async function getServers() {
    return await api.getServerListForAdmin.query();
}

export async function getServer(id: string) {
    return await api.getGuild.query(id);
}

export async function setMascot(guild: string, mascot: string) {
    return await api.setMascot.mutate({ guild, mascot }).catch(() => false);
}

export async function saveName(guild: string, name: string) {
    return await api.setName.mutate({ guild, name });
}

export async function setInvite(guild: string, invite: string) {
    return await api.setInvite.mutate({ guild, invite });
}

export async function validateInvite(guild: string, invite: string) {
    return await api.validateInvite.query({ guild, invite });
}

export async function setOwner(guild: string, owner: string) {
    return await api.setOwner.mutate({ guild, owner });
}

export async function setAdvisor(guild: string, advisor: string) {
    return await api.setAdvisor.mutate({ guild, advisor });
}

export async function swapRepresentatives(guild: string) {
    return await api.swapRepresentatives.mutate(guild);
}

export async function setDelegated(guild: string, delegated: boolean) {
    return await api.setDelegated.mutate({ guild, delegated });
}
