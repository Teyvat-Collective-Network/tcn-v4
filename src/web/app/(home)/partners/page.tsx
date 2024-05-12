"use server";

import { api } from "../../../lib/trpc";
import PartnersClient from "./client";

export default async function Partners() {
    return <PartnersClient servers={await api.getPartnerList.query()} />;
}
