"use server";

import { api } from "../../../../../lib/trpc";
import { withUserId } from "../../../../../lib/with-user";

export async function getChannels() {
    return await api.getGlobalChannels.query();
}

export async function getFilters() {
    return await api.getFilters.query();
}

export async function createChannel(name: string, visible: boolean, password: string | null) {
    return await withUserId(async (actor) => await api.createGlobalChannel.mutate({ actor, name, visible, password }));
}

export async function deleteChannel(id: number, password: string | null) {
    return await withUserId(async (actor) => await api.deleteGlobalChannel.mutate({ actor, id, password }));
}

export async function editGlobalChannelPassword(id: number, newPassword: string | null, password: string | null) {
    return await withUserId(async (actor) => await api.editGlobalChannelPassword.mutate({ actor, id, newPassword, password }));
}

export async function editGlobalChannelVisibility(id: number, visible: boolean, password: string | null) {
    return await withUserId(async (actor) => await api.editGlobalChannelVisibility.mutate({ actor, id, visible, password }));
}

export async function editGlobalChannelName(id: number, name: string, password: string | null) {
    return await withUserId(async (actor) => await api.editGlobalChannelName.mutate({ actor, id, name, password }));
}

export async function setChannelFilters(channel: number, filters: number[], password: string | null) {
    return await withUserId(async (actor) => await api.setFilters.mutate({ actor, channel, filters, password }));
}

export async function setChannelPriority(channel: number, priority: "high" | "normal" | "low") {
    return await withUserId(async (actor) => await api.setPriority.mutate({ actor, channel, priority }));
}
