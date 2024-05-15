"use server";

import { api } from "../../../../../lib/trpc";
import { withUserId } from "../../../../../lib/with-user";

export async function getFilter(id: number) {
    return await api.getFilter.query(id);
}

export async function getFilters() {
    return await api.getFilters.query();
}

export async function addTermToFilter(id: number, term: string, regex: boolean) {
    return await withUserId(async (actor) => await api.addTermToFilter.mutate({ actor, id, term, regex }));
}

export async function createFilter(name: string) {
    return await withUserId(async (actor) => await api.createFilter.mutate({ actor, name }));
}

export async function deleteFilterTerm(id: number) {
    return await withUserId(async (actor) => await api.deleteFilterTerm.mutate({ actor, id }));
}

export async function deleteFilter(id: number) {
    return await withUserId(async (actor) => await api.deleteFilter.mutate({ actor, id }));
}

export async function editFilterTermRegex(id: number, regex: boolean) {
    return await withUserId(async (actor) => await api.editFilterTermRegex.mutate({ actor, id, regex }));
}

export async function editFilterTermTerm(id: number, term: string) {
    return await withUserId(async (actor) => await api.editFilterTermTerm.mutate({ actor, id, term }));
}

export async function renameFilter(id: number, name: string) {
    return await withUserId(async (actor) => await api.renameFilter.mutate({ actor, id, name }));
}
