import React from "react";
import { Menu } from "./menu";
import { TopBar } from "./top-bar";
import { Container } from "./ui/container";

export function Nav({ root, children }: React.PropsWithChildren<{ root: string }>) {
    return (
        <>
            <Menu root={root}></Menu>
            <TopBar root={root}></TopBar>
            <Container>{children}</Container>
        </>
    );
}
