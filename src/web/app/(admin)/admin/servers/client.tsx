"use client";

import { useEffect, useState } from "react";
import { FaCheck, FaFloppyDisk, FaPencil, FaPlus, FaRotateRight, FaShuffle } from "react-icons/fa6";
import { Loading } from "../../../../components/loading";
import { Button } from "../../../../components/ui/button";
import { ComboSelector } from "../../../../components/ui/combo-selector";
import { Input } from "../../../../components/ui/input";
import { Switch } from "../../../../components/ui/switch";
import UserMention from "../../../../components/ui/user-mention";
import {
    getCharacters,
    getServer,
    getServers,
    removeGuild,
    saveName,
    setAdvisor,
    setDelegated,
    setInvite,
    setMascot,
    setOwner,
    swapRepresentatives,
    validateInvite,
} from "./actions";

export default function AdminServersClient({
    characters: chinput,
    servers: input,
}: {
    characters: { id: string; name: string }[];
    servers: { id: string; name: string }[];
}) {
    const [characters, setCharacters] = useState(chinput);
    const [servers, setServers] = useState(input);
    const [server, setServer] = useState<string | null>(null);

    const [data, setData] = useState<{
        mascot: string;
        name: string;
        invite: string;
        owner: string;
        advisor: string | null;
        delegated: boolean;
    } | null>(null);

    const [name, setName] = useState<string>("");

    useEffect(() => setName(data?.name ?? ""), [data, setName]);

    async function reload() {
        setCharacters(await getCharacters());

        const s = await getServers();
        setServers(s);

        setData(null);

        if (!s.some((x) => x.id === server)) setServer(null);
        else if (server) setData(await getServer(server));
    }

    return (
        <>
            <div className="flex items-center gap-4">
                <ComboSelector
                    values={servers.map((server) => ({ label: server.name, value: server.id }))}
                    value={server}
                    setValue={async (server) => {
                        if (server === null) return;
                        setServer(server);
                        setData(await getServer(server));
                    }}
                />
                <Button variant="secondary" onClick={reload}>
                    <FaRotateRight />
                </Button>
                <a href="/admin/servers/new">
                    <Button variant="secondary" className="flex items-center gap-2">
                        <FaPlus /> Add Server
                    </Button>
                </a>
            </div>
            <br />
            <hr />
            <br />
            {server ? (
                data ? (
                    <>
                        <div className="grid grid-cols-[max-content_1fr] items-center gap-4">
                            <b>ID:</b>
                            <code>{server}</code>
                            <b>Mascot:</b>
                            <div className="flex items-center gap-4">
                                <ComboSelector
                                    values={characters.map((char) => ({ label: char.name, value: char.id }))}
                                    value={data.mascot}
                                    setValue={async (mascot) => {
                                        if (mascot === null) return;
                                        if (!confirm(`Set ${data.name}'s mascot to ${characters.find((char) => char.id === mascot)?.name}?`)) return;

                                        const valid = await setMascot(server, mascot);
                                        if (valid) reload();
                                        else alert("Operation failed; try reloading.");
                                    }}
                                />
                                <a href="/admin/characters" target="_blank">
                                    <Button variant="secondary" className="flex items-center gap-2">
                                        <FaPlus /> Create
                                    </Button>
                                </a>
                            </div>
                            <b>Name:</b>
                            <div className="flex items-center gap-4">
                                <div>
                                    <Input value={name} onChange={({ currentTarget: { value } }) => setName(value)} maxLength={80} />
                                </div>
                                <Button
                                    variant="secondary"
                                    disabled={name === data.name || name.trim() === ""}
                                    onClick={async () => {
                                        const error = await saveName(server, name);
                                        if (error) alert(`Error: ${error}`);
                                        else reload();
                                    }}
                                >
                                    <FaFloppyDisk />
                                </Button>
                            </div>
                            <b>Invite:</b>
                            <div className="flex items-center gap-4">
                                <code>discord.gg/{data.invite}</code>
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    onClick={async () => {
                                        const invite = prompt("Enter a new invite:")?.trim();
                                        if (!invite) return;

                                        const error = await setInvite(server, invite);
                                        if (error) alert(`Error: ${error}`);
                                        else reload();
                                    }}
                                >
                                    <FaPencil /> Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    onClick={async () => {
                                        const error = await validateInvite(server, data.invite);
                                        if (error) alert(`Error: ${error}`);
                                        else alert("That invite looks okay.");
                                    }}
                                >
                                    <FaCheck /> Verify
                                </Button>
                            </div>
                            <b>Owner:</b>
                            <div className="flex items-center gap-4">
                                <UserMention id={data.owner} />
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    onClick={async () => {
                                        const owner = prompt("Enter the new owner's ID:")?.trim();
                                        if (!owner) return;

                                        const error = await setOwner(server, owner);
                                        if (error) alert(`Error: ${error}`);
                                        else reload();
                                    }}
                                >
                                    <FaPencil /> Edit
                                </Button>
                            </div>
                            <b>Advisor:</b>
                            <div className="flex items-center gap-4">
                                {data.advisor ? <UserMention id={data.advisor} /> : <span className="opacity-50">(none)</span>}
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    onClick={async () => {
                                        const advisor = prompt("Enter the new advisor's ID (leave empty to remove):")?.trim();
                                        if (advisor === undefined) return;

                                        const error = await setAdvisor(server, advisor);
                                        if (error) alert(`Error: ${error}`);
                                        else reload();
                                    }}
                                >
                                    <FaPencil /> Edit
                                </Button>
                                {data.advisor ? (
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2"
                                        onClick={async () => {
                                            if (!confirm(`Swap ${data.name}'s owner and advisor?`)) return;

                                            const error = await swapRepresentatives(server);
                                            if (error) alert(`Error:${error}`);
                                            else reload();
                                        }}
                                    >
                                        <FaShuffle /> Switch With Owner
                                    </Button>
                                ) : null}
                            </div>
                            <b>Voter:</b>
                            <div className="flex items-center gap-4">
                                Owner
                                <Switch
                                    checked={data.delegated}
                                    disabled={!data.advisor}
                                    onCheckedChange={async (checked) => {
                                        if (!confirm(checked ? "Delegate the voter role to the advisor?" : "Return the voter role to the owner?")) return;

                                        const error = await setDelegated(server, checked);
                                        if (error) alert(`Error:${error}`);
                                        else reload();
                                    }}
                                />
                                Advisor
                            </div>
                        </div>
                        <br />
                        <Button
                            onClick={async () => {
                                if (!confirm(`Remove ${data.name} from the TCN?`)) return;

                                const error = await removeGuild(server);
                                if (error) alert(`Error: ${error}`);
                                else reload();
                            }}
                        >
                            Remove from TCN
                        </Button>
                    </>
                ) : (
                    <Loading>Loading...</Loading>
                )
            ) : (
                <div className="prose">
                    <p>Select a server to get started.</p>
                </div>
            )}
        </>
    );
}
