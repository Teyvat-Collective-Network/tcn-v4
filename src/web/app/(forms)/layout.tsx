"use client";

import { redirect, usePathname } from "next/navigation";
import React from "react";
import { Nav } from "../../components/nav";
import { useUserContext } from "../../context/user";

export default function FormLayout({ children }: React.PropsWithChildren) {
    const user = useUserContext();
    const pathname = usePathname();

    if (!user) return redirect(`/auth/login?${new URLSearchParams({ redirect: pathname || "/forms" })}`);

    return <Nav root="/forms">{children}</Nav>;
}
