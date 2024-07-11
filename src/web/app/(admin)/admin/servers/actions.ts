"use server";

import getUser from "../../../../lib/get-user";
import { api } from "../../../../lib/trpc";
import { withUserId } from "../../../../lib/with-user";

export async function syncPartnerLists() {
    return await api.syncPartnerLists.mutate();
}

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
    const user = await getUser();
    if (!user?.observer) return false;

    return await api.setMascot.mutate({ actor: user.id, guild, mascot }).catch(() => false);
}

export async function saveName(guild: string, name: string) {
    return await withUserId(async (actor) => await api.setName.mutate({ actor, guild, name }));
}

export async function setInvite(guild: string, invite: string) {
    return await withUserId(async (actor) => await api.setInvite.mutate({ actor, guild, invite }));
}

export async function validateInvite(guild: string, invite: string) {
    return await api.validateInvite.query({ guild, invite });
}

export async function setOwner(guild: string, owner: string) {
    return await withUserId(async (actor) => await api.setOwner.mutate({ actor, guild, owner }));
}

export async function setAdvisor(guild: string, advisor: string) {
    return await withUserId(async (actor) => await api.setAdvisor.mutate({ actor, guild, advisor }));
}

export async function swapRepresentatives(guild: string) {
    return await withUserId(async (actor) => await api.swapRepresentatives.mutate({ actor, guild }));
}

export async function setDelegated(guild: string, delegated: boolean) {
    return await withUserId(async (actor) => api.setDelegated.mutate({ actor, guild, delegated }));
}

export async function removeGuild(guild: string) {
    return await withUserId(async (actor) => api.removeGuild.mutate({ actor, id: guild }));
}
