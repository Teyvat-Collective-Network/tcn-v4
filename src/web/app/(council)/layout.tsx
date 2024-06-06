"use client";

import { redirect, usePathname } from "next/navigation";
import React from "react";
import { Nav } from "../../components/nav";
import { useUserContext } from "../../context/user";

export default function CouncilLayout({ children }: React.PropsWithChildren) {
    const user = useUserContext();
    const pathname = usePathname();

    if (!user) return redirect(`/auth/login?${new URLSearchParams({ redirect: pathname || "/council" })}`);
    if (!user.council) return redirect("/");

    return <Nav root="/council">{children}</Nav>;
}
