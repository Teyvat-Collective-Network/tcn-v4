"use client";

import { redirect, usePathname } from "next/navigation";
import React from "react";
import { Nav } from "../../../components/nav";
import { useUserContext } from "../../../context/user";

export default function GlobalLayout({ children }: React.PropsWithChildren) {
    const user = useUserContext();
    const pathname = usePathname();

    if (!user) return redirect(`/auth/login?${new URLSearchParams({ redirect: pathname || "/global" })}`);
    if (!user.globalMod) return redirect("/");

    return <Nav root="/global">{children}</Nav>;
}
