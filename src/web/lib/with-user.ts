"use server";

import getUser, { getId } from "./get-user";

const LOGGED_OUT = "You seem to have been logged out. Please reload this page.";
const NOT_OBSERVER = "You no longer seem to be an observer.";

export async function withUserId(fn: (userId: string) => Promise<string | null>, ensureObserver: boolean = true): Promise<string | null> {
    if (ensureObserver) {
        const user = await getUser();
        if (!user) return LOGGED_OUT;
        if (!user?.observer) return NOT_OBSERVER;
        return await fn(user.id);
    } else {
        const id = await getId();
        if (!id) return LOGGED_OUT;
        return await fn(id);
    }
}
