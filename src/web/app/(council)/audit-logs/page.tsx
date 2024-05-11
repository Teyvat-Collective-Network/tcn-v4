"use server";

import { api } from "../../../lib/trpc";
import { getAuditLogs } from "./actions";
import AuditLogsClient from "./client";

export default async function AuditLogs() {
    return <AuditLogsClient guilds={await api.getGuildsForDropdown.query()} initial={await getAuditLogs(null, null, null, null, 0, 25)}></AuditLogsClient>;
}
