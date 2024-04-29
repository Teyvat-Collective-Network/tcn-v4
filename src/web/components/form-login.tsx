"use client";

import React from "react";
import { useUserContext } from "../context/user";
import { Panel } from "./ui/panel";

export function FormLogin({ children }: React.PropsWithChildren) {
    const user = useUserContext();

    return (
        <>
            <Panel highlight>
                {user ? (
                    <p>
                        Logged in as <b>@{user.name}</b>. Your user ID will be submitted with this form. Not you?{" "}
                        <a href="/auth/logout" className="link">
                            Log Out
                        </a>
                    </p>
                ) : (
                    <p>
                        Please{" "}
                        <a href="/auth/login" className="link">
                            log in
                        </a>{" "}
                        to fill out this form.
                    </p>
                )}
            </Panel>
            {user ? (
                <>
                    <br />
                    {children}
                </>
            ) : null}
        </>
    );
}
