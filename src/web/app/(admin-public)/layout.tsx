"use client";

import React from "react";
import { Nav } from "../../components/nav";

export default function AdminLayout({ children }: React.PropsWithChildren) {
    return <Nav root="/admin">{children}</Nav>;
}
