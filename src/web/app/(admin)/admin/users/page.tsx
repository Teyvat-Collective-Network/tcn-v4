"use server";

import { api } from "../../../../lib/trpc";
import AdminUsersClient from "./client";

export default async function AdminUsers() {
    return <AdminUsersClient guilds={await api.getGuildsForDropdown.query()} />;
}
