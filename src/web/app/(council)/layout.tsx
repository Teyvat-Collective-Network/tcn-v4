import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { Nav } from "../../components/nav";
import getUser from "../../lib/get-user";

export default async function FormLayout({ children }: React.PropsWithChildren) {
    const user = await getUser();

    if (!user) return redirect(`/auth/login?${new URLSearchParams({ redirect: headers().get("host") || "/council" })}`);
    if (!user.council) return redirect("/");

    return <Nav root="/council">{children}</Nav>;
}
