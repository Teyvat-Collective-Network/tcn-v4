"use server";

import { getFilters } from "./actions";
import GlobalFiltersClient from "./client";

export default async function GlobalFilters() {
    return <GlobalFiltersClient filters={await getFilters()} />;
}
