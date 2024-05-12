"use server";

import getUser from "../../../../lib/get-user";
import { api } from "../../../../lib/trpc";

export async function getCharacters() {
    return await api.getCharacters.query();
}

export async function changeCharacterId(old: string, set: string) {
    const user = await getUser();
    if (!user?.observer) return false;

    return await api.changeCharacterId.mutate({ old, set });
}

export async function setCharacterShortName(id: string, short: string) {
    const user = await getUser();
    if (!user?.observer) return false;

    return await api.setCharacterShortName.mutate({ id, short });
}

export async function setCharacterFullName(id: string, name: string) {
    const user = await getUser();
    if (!user?.observer) return false;

    return await api.setCharacterFullName.mutate({ id, name });
}

export async function setCharacterElement(id: string, element: string) {
    const user = await getUser();
    if (!user?.observer) return false;

    return await api.setCharacterElement.mutate({ id, element });
}

export async function deleteCharacter(id: string) {
    const user = await getUser();
    if (!user?.observer) return false;

    return await api.deleteCharacter.mutate(id);
}

export async function addCharacter(id: string, short: string, name: string, element: string) {
    const user = await getUser();
    if (!user?.observer) return false;

    return await api.addCharacter.mutate({ id, short, name, element });
}
