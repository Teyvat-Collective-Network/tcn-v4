"use server";

import { api } from "../../../../lib/trpc";

export async function getMetricsChart(key: string) {
    return await api.getMetricsChart.query(key);
}
