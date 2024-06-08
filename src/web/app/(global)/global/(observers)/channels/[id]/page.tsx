"use client";

import { useEffect, useState } from "react";
import { FaAt, FaEye } from "react-icons/fa6";
import { Loading } from "../../../../../../components/loading";
import { Button } from "../../../../../../components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../../../../../../components/ui/dialog";
import { Input } from "../../../../../../components/ui/input";
import Mention from "../../../../../../components/ui/mention";
import { Prose } from "../../../../../../components/ui/prose";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../components/ui/table";
import { getGlobalChannel, getGlobalConnectionDetails } from "./actions";

export default function GlobalChannelDiagnose({ params: { id: raw } }: { params: { id: string } }) {
    const id = parseInt(raw);

    const [channel, setChannel] = useState<{ name: string } | null | undefined>(null);
    const [connections, setConnections] = useState<{ guild: string; guildName: string | null; location: string }[]>([]);
    const [locationNames, setLocationNames] = useState<Record<string, string>>({});
    const [locationUsers, setLocationUsers] = useState<Record<string, { id: string; name: string }[]>>({});
    const [query, setQuery] = useState<string>("");

    useEffect(() => {
        if (isNaN(id) || id <= 0) return;

        getGlobalChannel(id)
            .then(async ({ channel, connections }) => {
                setChannel(channel);
                setConnections(connections);

                for (const connection of connections)
                    try {
                        const data = (await getGlobalConnectionDetails(connection.location)) ?? { name: "[ERROR!]", guildName: "[ERROR!]", users: [] };

                        if (!connection.guildName)
                            setConnections((prev) => prev.map((conn) => (conn.guild === connection.guild ? { ...conn, guildName: data.guildName } : conn)));

                        setLocationNames((prev) => ({ ...prev, [connection.location]: data.name }));
                        setLocationUsers((prev) => ({ ...prev, [connection.location]: data.users }));
                    } catch {
                        alert(`An error occurred fetching the connection details for ${connection.guild}/${connection.location}.`);
                    }
            })
            .catch(() => alert("An error occurred fetching the channel and connection data from the API."));
    }, [id]);

    if (isNaN(id) || id <= 0)
        return (
            <Prose>
                <h1>Invalid ID</h1>
                <p>ID should be a positive integer.</p>
            </Prose>
        );

    if (channel === null) return <Loading>Loading channel and connection data...</Loading>;

    if (channel === undefined)
        return (
            <Prose>
                <h1>Channel Not Found</h1>
                <p>
                    Double-check that this ID corresponds to a valid global channel.{" "}
                    <a href="/global/channels" className="link">
                        [return to channel list]
                    </a>
                </p>
            </Prose>
        );

    return (
        <Prose>
            <h1>
                Diagnosing global channel <code>{channel.name}</code>
            </h1>
            <h2>Connections</h2>
            <p>Filter for channels visible to a user:</p>
            <Input value={query} onChange={({ currentTarget: { value } }) => setQuery(value)} placeholder="User ID" />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Guild</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Users</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {connections
                        .filter((conn) => query === "" || (locationUsers[conn.location] ?? []).some((user) => user.id === query))
                        .map(({ guild, guildName, location }) => (
                            <TableRow key={guild}>
                                <TableCell>
                                    <span className="flex items-center gap-2">
                                        {guildName === null ? <Loading size={20}>Loading guild name...</Loading> : guildName}
                                        <code>{guild}</code>
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="flex items-center gap-2">
                                        {location in locationNames ? `#${locationNames[location]}` : <Loading size={20}>Loading channel name...</Loading>}
                                        <code>{location}</code>
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {location in locationUsers ? (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="secondary">
                                                    <FaEye />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <Prose>
                                                    <ul>
                                                        {locationUsers[location].map((user) => (
                                                            <li key={user.id}>
                                                                <span className="flex items-center gap-2">
                                                                    <Mention>
                                                                        <FaAt /> {user.name}
                                                                    </Mention>
                                                                    <code>{user.id}</code>
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </Prose>
                                            </DialogContent>
                                        </Dialog>
                                    ) : (
                                        <Loading size={20}>Loading users...</Loading>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </Prose>
    );
}
