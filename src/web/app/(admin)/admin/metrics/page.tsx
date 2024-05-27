import { api } from "../../../../lib/trpc";
import AdminMetricsClient from "./client";

export default async function AdminMetrics() {
    return <AdminMetricsClient metrics={await api.getMetrics.query()} />;
}
