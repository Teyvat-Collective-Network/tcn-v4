"use server";

import { trpc } from "../../../lib/trpc";
import PartnersClient from "./client";

export default async function Partners() {
    return <PartnersClient servers={await trpc.getPartnerList.query()}></PartnersClient>;
}
