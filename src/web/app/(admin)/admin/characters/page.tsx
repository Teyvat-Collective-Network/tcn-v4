"use server";

import { getCharacters } from "./actions"
import AdminCharactersClient from "./client"

export default async function AdminCharacters() {
    return <AdminCharactersClient characters={await getCharacters()} />;
}
