"use client";

import { redirect, usePathname } from "next/navigation";
import React from "react";
import { Nav } from "../../components/nav";
import { useUserContext } from "../../context/user";

export default function AdminLayout({ children }: React.PropsWithChildren) {
    const user = useUserContext();
    const pathname = usePathname();

    if (!user) return redirect(`/auth/login?${new URLSearchParams({ redirect: pathname || "/admin" })}`);
    if (!user.observer) return redirect("/");

    return <Nav root="/admin">{children}</Nav>;
}
