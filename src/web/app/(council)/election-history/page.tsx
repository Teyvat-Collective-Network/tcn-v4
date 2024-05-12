"use server";

import { api } from "../../../lib/trpc";
import ElectionHistoryClient from "./client";

export default async function ElectionHistory() {
    return <ElectionHistoryClient {...await api.getElectionHistory.query()} />;
}
