import React from "react";
import { Panel } from "./panel";

export function LandingPage({ children }: React.PropsWithChildren) {
    return <div className="grid md:grid-cols-2 gap-2">{children}</div>;
}

export function LandingPanel({ href, children }: React.PropsWithChildren<{ href: string }>) {
    return (
        <a href={href}>
            <Panel className="h-full prose hover:scale-[98%] active:scale-[95%] transition-transform">{children}</Panel>
        </a>
    );
}
