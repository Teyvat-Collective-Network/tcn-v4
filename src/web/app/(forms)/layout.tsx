import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { Nav } from "../../components/nav";
import { Panel } from "../../components/ui/panel";
import getUser from "../../lib/get-user";

export default async function FormLayout({ children }: React.PropsWithChildren) {
    const user = await getUser();

    if (!user) return redirect(`/auth/login?${new URLSearchParams({ redirect: headers().get("host") || "/forms" })}`);

    return (
        <Nav root="/forms">
            <Panel highlight>
                <p>
                    Logged in as <b>@{user.name}</b>. Your user ID will be submitted with this form. Not you?{" "}
                    <a href="/auth/logout" className="link">
                        Log Out
                    </a>
                </p>
            </Panel>
            <br />
            {children}
        </Nav>
    );
}
