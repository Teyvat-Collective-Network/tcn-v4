"use server";

import { getCharacters, getServers } from "./actions";
import AdminServersClient from "./client";

export default async function AdminServers() {
    return <AdminServersClient characters={await getCharacters()} servers={await getServers()}></AdminServersClient>;
}
