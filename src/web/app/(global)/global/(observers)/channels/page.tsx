"use server";

import { getChannels } from "./actions";
import GlobalChannelsClient from "./client";

export default async function GlobalChannels() {
    return <GlobalChannelsClient channels={await getChannels()} />;
}
