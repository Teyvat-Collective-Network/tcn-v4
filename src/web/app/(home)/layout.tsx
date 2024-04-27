import React from "react";
import { Nav } from "../../components/nav";

export default async function HomeLayout({ children }: React.PropsWithChildren) {
    return <Nav root="/">{children}</Nav>;
}
