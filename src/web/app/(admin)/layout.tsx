import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { Nav } from "../../components/nav";
import getUser from "../../lib/get-user";

export default async function AdminLayout({ children }: React.PropsWithChildren) {
    const user = await getUser();

    if (!user) return redirect(`/auth/login?${new URLSearchParams({ redirect: headers().get("host") || "/admin" })}`);
    if (!user.observer) return redirect("/");

    return <Nav root="/admin">{children}</Nav>;
}
