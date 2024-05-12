"use server";

import { api } from "../../../lib/trpc";
import ObserverTermsClient from "./client";

export default async function ObserverTerms() {
    return <ObserverTermsClient observers={await api.getObserverList.query()} />;
}
