"use client";

import { useState } from "react";
import { FaAngleDown, FaAngleUp, FaAnglesDown, FaAnglesUp } from "react-icons/fa6";
import { Button } from "../../../../components/ui/button";
import { Prose } from "../../../../components/ui/prose";
import UserMention from "../../../../components/ui/user-mention";
import { submitElectionVote } from "./actions";

export default function ElectionClient(data: { wave: number; seats: number; token: string; candidates: string[]; ranked: string[]; countered: string[] }) {
    const [ranked, setRanked] = useState<string[]>(data.ranked);
    const [countered, setCountered] = useState<string[]>(data.countered);

    const [submitting, setSubmitting] = useState<boolean>(false);
    const [done, setDone] = useState<boolean>(false);

    const abstained = data.candidates.filter((id) => !ranked.includes(id) && !countered.includes(id));

    if (done)
        return (
            <Prose>
                <h1>Wave {data.wave} Election</h1>
                <h2>Thank you for voting!</h2>
                <p>Your vote has been saved. If you wish to change your vote, please request a new link.</p>
            </Prose>
        );

    return (
        <Prose>
            <h1>Wave {data.wave} Election</h1>
            <p>This page expires about 30 minutes after you opened it, after which you will need to obtain a new link.</p>
            <p>
                {data.seats} seat{data.seats === 1 ? " is" : "s are"} available for this election.
            </p>
            <hr className="my-8" />
            <h2>Ranked</h2>
            {ranked.length === 0 ? (
                <p>You have not voted in support of anyone in this election.</p>
            ) : (
                <>
                    <p>You have voted in favor of the following candidates:</p>
                    <ol>
                        {ranked.map((id, i) => (
                            <li key={id}>
                                <div className="inline-flex items-center gap-4">
                                    <UserMention id={id} />
                                    {i === 0 ? null : (
                                        <>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setRanked((ranked) => [id, ...ranked.filter((x) => x !== id)]);
                                                }}
                                            >
                                                <FaAnglesUp />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setRanked((ranked) => {
                                                        const idx = ranked.indexOf(id);
                                                        if (idx === 0 || idx === -1) return ranked;

                                                        return [...ranked.slice(0, idx - 1), id, ranked[idx - 1], ...ranked.slice(idx + 1)];
                                                    });
                                                }}
                                            >
                                                <FaAngleUp />
                                            </Button>
                                        </>
                                    )}
                                    {i === ranked.length - 1 ? null : (
                                        <>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setRanked((ranked) => {
                                                        const idx = ranked.indexOf(id);
                                                        if (idx === ranked.length - 1 || idx === -1) return ranked;

                                                        return [...ranked.slice(0, idx), ranked[idx + 1], id, ...ranked.slice(idx + 2)];
                                                    });
                                                }}
                                            >
                                                <FaAngleDown />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setRanked((ranked) => [...ranked.filter((x) => x !== id), id]);
                                                }}
                                            >
                                                <FaAnglesDown />
                                            </Button>
                                        </>
                                    )}
                                    <Button variant="secondary" onClick={() => setRanked((ranked) => ranked.filter((x) => x !== id))}>
                                        Abstain
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setRanked((ranked) => ranked.filter((x) => x !== id));
                                            setCountered((countered) => [...countered, id]);
                                        }}
                                    >
                                        Vote Against
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ol>
                </>
            )}
            <h2>Counter-Voted</h2>
            {countered.length === 0 ? (
                <p>You have not voted against anyone in this election.</p>
            ) : (
                <>
                    <p>You have voted against the following candidates:</p>
                    <ul>
                        {countered.map((id) => (
                            <li key={id}>
                                <div className="inline-flex items-center gap-4">
                                    <UserMention id={id} />
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setCountered((countered) => countered.filter((x) => x !== id));
                                            setRanked((ranked) => [...ranked, id]);
                                        }}
                                    >
                                        Rank
                                    </Button>
                                    <Button variant="secondary" onClick={() => setCountered((countered) => countered.filter((x) => x !== id))}>
                                        Abstain
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
            <h2>Abstained</h2>
            {abstained.length === 0 ? (
                <p>You have voted for or against every candidate in this election.</p>
            ) : (
                <>
                    <p>You have not voted for or against the following candidates:</p>
                    <ul>
                        {abstained.map((id) => (
                            <li key={id}>
                                <div className="inline-flex items-center gap-4">
                                    <UserMention id={id} />
                                    <Button variant="secondary" onClick={() => setRanked((ranked) => [...ranked, id])}>
                                        Rank
                                    </Button>
                                    <Button variant="secondary" onClick={() => setCountered((countered) => [...countered, id])}>
                                        Vote Against
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
            <hr className="my-8" />
            <Button
                disabled={submitting}
                onClick={async () => {
                    setSubmitting(true);

                    try {
                        const error = await submitElectionVote(data.token, ranked, countered);
                        if (error) alert(error);
                        else setDone(true);
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                Save
            </Button>
        </Prose>
    );
}
