"use client";

import { redirect, usePathname } from "next/navigation";
import React from "react";
import { useUserContext } from "../../../../context/user";

export default function GlobalAdminLayout({ children }: React.PropsWithChildren) {
    const user = useUserContext();
    const pathname = usePathname();

    if (!user) return redirect(`/auth/login?${new URLSearchParams({ redirect: pathname || "/admin" })}`);
    if (!user.observer) return redirect("/");

    return children;
}
