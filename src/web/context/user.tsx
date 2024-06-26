"use client";

import { createContext, useContext } from "react";
import { User } from "../lib/types.js";

const UserContext = createContext<User | null>(null);

export function UserWrapper({ user, children }: React.PropsWithChildren<{ user: User | null }>) {
    return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUserContext() {
    return useContext(UserContext);
}
