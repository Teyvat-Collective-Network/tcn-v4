"use client";

import React, { useState } from "react";
import { FaPencil, FaRotateRight, FaServer } from "react-icons/fa6";
import { Loading } from "../../../../components/loading";
import { Button } from "../../../../components/ui/button";
import Mention from "../../../../components/ui/mention";
import TimeMention from "../../../../components/ui/time-mention";
import UserMention from "../../../../components/ui/user-mention";
import { getServers, getUserForAdmin, refreshTerm, setGlobalNickname, setObserver } from "./actions";

export default function AdminUsersClient({ guilds }: { guilds: { id: string; name: string }[] }) {
    const [id, setId] = useState<string>("");
    const [servers, setServers] = useState(guilds);

    const [data, setData] = useState<{
        observer: boolean;
        observerSince: number;
        globalNickname: string | null;
        owns: string[];
        advises: string[];
        staffs: string[];
    } | null>(null);

    const guildNames = Object.fromEntries(servers.map((guild) => [guild.id, guild.name]));

    function reload(force?: string) {
        getUserForAdmin(force ?? id)
            .then(setData)
            .catch(() => alert("Error fetching user."));
    }

    return (
        <>
            <div className="flex items-center gap-4">
                <b>User:</b>
                {id ? <UserMention id={id} /> : <span className="opacity-50">(enter a user to start)</span>}
                <Button
                    variant="secondary"
                    onClick={() => {
                        const id = prompt("Enter a user ID:");
                        if (!id) return;
                        if (!id.match(/^[1-9][0-9]{16,19}$/)) return alert("Invalid user ID.");
                        setId(id);
                        setData(null);
                        reload(id);
                    }}
                >
                    <FaPencil />
                </Button>
                <Button
                    variant="secondary"
                    onClick={async () => {
                        setData(null);
                        reload();
                        setServers(await getServers());
                    }}
                >
                    <FaRotateRight />
                </Button>
            </div>
            <hr className="my-8" />
            {id ? (
                data === null ? (
                    <Loading>Loading...</Loading>
                ) : (
                    <>
                        <div className="grid grid-cols-[max-content_1fr] items-center gap-4">
                            <b>Observer:</b>
                            <div className="flex items-center gap-4">
                                <span>
                                    {data.observer ? (
                                        <>
                                            Yes, since <TimeMention time={data.observerSince} />
                                        </>
                                    ) : (
                                        <>No</>
                                    )}
                                </span>
                                <Button
                                    variant="secondary"
                                    onClick={async () => {
                                        if (!confirm(`Really ${data.observer ? "demote" : "promote"} this user?`)) return;
                                        const error = await setObserver(id, !data.observer);
                                        if (error) alert(error);
                                        reload();
                                    }}
                                >
                                    {data.observer ? "Demote" : "Promote"}
                                </Button>
                                {data.observer ? (
                                    <Button
                                        variant="secondary"
                                        onClick={async () => {
                                            if (!confirm("Refresh this user's term?")) return;
                                            const error = await refreshTerm(id);
                                            if (error) alert(error);
                                            reload();
                                        }}
                                    >
                                        Refresh Term
                                    </Button>
                                ) : null}
                            </div>
                            <b>Global Nickname:</b>
                            <div className="flex items-center gap-4">
                                {data.globalNickname || <span className="opacity-50">(none)</span>}
                                <Button
                                    variant="secondary"
                                    onClick={async () => {
                                        const name = prompt("Enter a new global nickname:");
                                        if (name === null) return;
                                        if (name.length > 40) return "Nickname too long (maximum 40 characters).";
                                        const error = await setGlobalNickname(id, name);
                                        if (error) alert(error);
                                        reload();
                                    }}
                                >
                                    <FaPencil />
                                </Button>
                            </div>
                            <b>Council Position:</b>
                            {data.owns.length + data.advises.length === 0 ? (
                                <span className="opacity-50">(none)</span>
                            ) : (
                                <div>
                                    {data.owns
                                        .map((id) => ({ position: "Owner", id }))
                                        .concat(data.advises.map((id) => ({ position: "Advisor", id })))
                                        .map(({ position, id }, index) => (
                                            <React.Fragment key={`${position}/${id}`}>
                                                {index === 0 ? "" : ", "}
                                                {position} of{" "}
                                                <Mention>
                                                    <FaServer /> {guildNames[id] ?? id}
                                                </Mention>
                                            </React.Fragment>
                                        ))}
                                </div>
                            )}
                            <b>Staff Positions:</b>
                            {data.staffs.length === 0 ? (
                                <span className="opacity-50">(none)</span>
                            ) : (
                                <div>
                                    {data.staffs.map((id, index) => (
                                        <React.Fragment key={id}>
                                            {index === 0 ? "" : ", "}
                                            <Mention>
                                                <FaServer /> {guildNames[id] ?? id}
                                            </Mention>
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )
            ) : null}
        </>
    );
}
