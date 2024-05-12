import React from "react";
import { Menu } from "./menu";
import { TopBar } from "./top-bar";
import { Container } from "./ui/container";

export function Nav({ root, children }: React.PropsWithChildren<{ root: string }>) {
    return (
        <>
            <Menu root={root} />
            <TopBar root={root} />
            <Container>{children}</Container>
        </>
    );
}
