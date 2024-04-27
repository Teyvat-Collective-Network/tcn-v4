import React from "react";
import { FaLink } from "react-icons/fa6";

export function Section({ id, tag, children }: React.PropsWithChildren<{ id: string; tag: `h${1 | 2 | 3 | 4 | 5 | 6}` }>) {
    const Tag = tag;

    return (
        <Tag className="flex items-center gap-4">
            <a id={id} href={`#${id}`}>
                <FaLink></FaLink>
            </a>
            {children}
        </Tag>
    );
}
