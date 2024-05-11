"use server";

import { api } from "../../../../lib/trpc";
import { withUserId } from "../../../../lib/with-user";

export async function getServers() {
    return await api.getServerListForAdmin.query();
}

export async function getUserForAdmin(id: string) {
    return await api.getUserForAdmin.query(id);
}

export async function setObserver(user: string, observer: boolean) {
    return await withUserId(async (actor) => await api.setObserver.mutate({ actor, user, observer }));
}

export async function refreshTerm(user: string) {
    return await withUserId(async (actor) => await api.refreshTerm.mutate({ actor, user }));
}

export async function setGlobalNickname(user: string, name: string) {
    return await withUserId(async (actor) => await api.setGlobalNickname.mutate({ actor, user, name }));
}
