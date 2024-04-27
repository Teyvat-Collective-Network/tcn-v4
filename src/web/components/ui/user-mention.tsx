"use client";

import { Suspense, useEffect, useState } from "react";
import { FaAt, FaSpinner } from "react-icons/fa6";
import { useTagsContext } from "../../context/tags";
import { getTag } from "../../lib/actions";
import Mention from "./mention";

const pcache: Record<string, Promise<string>> = {};
const cache: Record<string, string> = {};

export default function UserMention({ id }: { id: string }) {
    const [isClient, setIsClient] = useState<boolean>(false);

    useEffect(() => setIsClient(true), [setIsClient]);

    if (id in cache)
        return (
            <Mention>
                <FaAt></FaAt> {cache[id]}
            </Mention>
        );

    const loading = (
        <Mention>
            <FaSpinner></FaSpinner> Loading user {id}
        </Mention>
    );

    if (!isClient) return loading;

    return (
        <Suspense fallback={loading}>
            <Core id={id}></Core>
        </Suspense>
    );
}

async function Core({ id }: { id: string }) {
    const { tags, setTag } = useTagsContext();
    const ptag = id in tags ? tags[id] : id in pcache ? pcache[id] : setTag(id, getTag(id));
    pcache[id] = ptag;
    const tag = (cache[id] = await ptag);
    return (
        <Mention>
            <FaAt></FaAt> {tag}
        </Mention>
    );
}
