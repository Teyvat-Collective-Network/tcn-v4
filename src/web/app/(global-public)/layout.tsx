"use client";

import React from "react";
import { Nav } from "../../components/nav";

export default function GlobalLayout({ children }: React.PropsWithChildren) {
    return <Nav root="/global">{children}</Nav>;
}
