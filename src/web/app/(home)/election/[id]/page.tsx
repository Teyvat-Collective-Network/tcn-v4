"use server";

import { Prose } from "../../../../components/ui/prose";
import { api } from "../../../../lib/trpc";
import ElectionClient from "./client";

export default async function Election({ searchParams: { token } }: { searchParams: { token: string } }) {
    const data = await api.exchangeDataForElection.query(token);

    if (data.error)
        return (
            <Prose>
                <b>Error:</b> {data.error}
            </Prose>
        );

    return (
        <ElectionClient
            wave={data.wave}
            seats={data.seats}
            token={data.token}
            candidates={data.candidates}
            ranked={data.ranked}
            countered={data.countered}
        ></ElectionClient>
    );
}
