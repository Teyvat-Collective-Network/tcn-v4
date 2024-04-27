"use client";

import { ReactNode } from "react";

export default function Mention({ children }: { children: ReactNode }) {
    return <span className="mention inline-flex items-center gap-2 bg-[#90b9e2] dark:bg-[#1f3c59] px-2 rounded translate-y-[0.1rem]">{children}</span>;
}
