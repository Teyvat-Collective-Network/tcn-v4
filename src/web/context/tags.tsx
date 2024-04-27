"use client";

import { ReactNode, createContext, useContext, useState } from "react";

const TagsContext = createContext<{ tags: Record<string, Promise<string>>; setTag: (id: string, tag: Promise<string>) => Promise<string> }>({
    tags: {},
    setTag: async (_, __) => "",
});

export function TagsWrapper({ children }: { children: ReactNode }) {
    const [tags, setTags] = useState<Record<string, Promise<string>>>({});
    return <TagsContext.Provider value={{ tags, setTag: (id, tag) => (setTags((tags) => ({ ...tags, [id]: tag })), tag) }}>{children}</TagsContext.Provider>;
}

export function useTagsContext() {
    return useContext(TagsContext);
}
