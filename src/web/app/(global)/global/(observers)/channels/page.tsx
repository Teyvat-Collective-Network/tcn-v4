"use server";

import { getChannels, getFilters } from "./actions";
import GlobalChannelsClient from "./client";

export default async function GlobalChannels() {
    return <GlobalChannelsClient channels={await getChannels()} filters={await getFilters()} />;
}
