"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash, FaPencil, FaPlus, FaTrash, FaWaveSquare } from "react-icons/fa6";
import { Button } from "../../../../../components/ui/button";
import { ComboMultiSelector, ComboSelector } from "../../../../../components/ui/combo-selector";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../components/ui/table";
import {
    createChannel,
    deleteChannel,
    editGlobalChannelName,
    editGlobalChannelPassword,
    editGlobalChannelVisibility,
    getChannels,
    getFilters,
    setChannelFilters,
    setChannelPriority,
} from "./actions";

export default function GlobalChannelsClient({
    channels: initial,
    filters: initialFilters,
}: {
    channels: {
        id: number;
        name: string;
        visible: boolean;
        protected: boolean;
        hasPassword: boolean;
        logs: string | null;
        filters: number[];
        priority: string;
    }[];
    filters: { id: number; name: string }[];
}) {
    const [channels, setChannels] = useState(initial);
    const [filters, setFilters] = useState(initialFilters);

    async function reload() {
        setChannels(await getChannels());
        setFilters(await getFilters());
    }

    async function newChannel(visible: boolean) {
        const name = prompt("Enter the channel name (maximum 80 characters):")?.trim();
        if (name === undefined) return;
        if (name.length > 80) return alert("Channel name exceeds maximum length.");

        const password = prompt("Enter a password (optional, maximum 128 characters):")?.trim();
        if (password === undefined) return;
        if (password.length > 128) return alert("Password exceeds maximum length.");

        const error = await createChannel(name, visible, password || null);
        if (error) alert(error);

        reload();
    }

    return (
        <div>
            <div className="flex items-center gap-4">
                <Button variant="secondary" className="flex items-center gap-2" onClick={() => newChannel(false)}>
                    <FaPlus />
                    New Private Channel
                </Button>
                <Button variant="secondary" className="flex items-center gap-2" onClick={() => newChannel(true)}>
                    <FaPlus />
                    New Public Channel
                </Button>
            </div>
            <br />
            <Table className="prose">
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead className="whitespace-nowrap">Channel Name</TableHead>
                        <TableHead>Visibility</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Applied Filters</TableHead>
                        <TableHead />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {channels.map((channel) => (
                        <TableRow key={channel.id}>
                            <TableCell>
                                <code>{channel.id}</code>
                            </TableCell>
                            <TableCell className="flex items-center gap-4">
                                <Button
                                    variant="secondary"
                                    onClick={async () => {
                                        const name = prompt("Enter the new channel name (maximum 80 characters):")?.trim();
                                        if (name === undefined) return;
                                        if (name.length > 80) return alert("Channel name exceeds maximum length.");

                                        const password = channel.hasPassword ? prompt("Enter the channel's password:")?.trim() : null;
                                        if (password === undefined) return;
                                        if (password === "") return alert("Password cannot be empty.");

                                        const error = await editGlobalChannelName(channel.id, name, password);
                                        if (error) alert(error);

                                        reload();
                                    }}
                                >
                                    <FaPencil />
                                </Button>
                                {channel.name}
                            </TableCell>
                            <TableCell>{channel.visible ? "Public" : "Private"}</TableCell>
                            <TableCell>
                                <ComboSelector
                                    values={[
                                        { value: "high", label: "High" },
                                        { value: "normal", label: "Normal" },
                                        { value: "low", label: "Low" },
                                    ]}
                                    value={channel.priority}
                                    setValue={async (priority) => {
                                        if (priority === null) return;
                                        const error = await setChannelPriority(channel.id, priority as any);
                                        if (error) alert(error);
                                        reload();
                                    }}
                                ></ComboSelector>
                            </TableCell>
                            <TableCell>
                                <ComboMultiSelector
                                    values={filters.map((filter) => ({ label: filter.name, value: `${filter.id}` }))}
                                    selected={channel.filters.map((x) => `${x}`)}
                                    setSelected={async (selected) => {
                                        const password = channel.hasPassword ? prompt("Enter the channel's password:")?.trim() : null;
                                        if (password === undefined) return;
                                        if (password === "") return alert("Password cannot be empty.");

                                        const error = await setChannelFilters(
                                            channel.id,
                                            selected.map((x) => +x),
                                            password,
                                        );

                                        if (error) alert(error);
                                        reload();
                                    }}
                                    placeholder="Select filters to apply."
                                ></ComboMultiSelector>
                            </TableCell>
                            <TableCell className="flex items-center gap-4">
                                <Button
                                    variant="secondary"
                                    disabled={channel.protected}
                                    onClick={async () => {
                                        if (!confirm("Are you sure you want to delete this channel?")) return;

                                        const password = channel.hasPassword ? prompt("Enter the channel's password:")?.trim() : null;
                                        if (password === undefined) return;
                                        if (password === "") return alert("Password cannot be empty.");

                                        const error = await deleteChannel(channel.id, password);
                                        if (error) alert(error);

                                        reload();
                                    }}
                                >
                                    <FaTrash />
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={async () => {
                                        if (!confirm(`Are you sure you want to make this channel ${channel.visible ? "private" : "public"}?`)) return;

                                        const password = channel.hasPassword ? prompt("Enter the channel's password:")?.trim() : null;
                                        if (password === undefined) return;
                                        if (password === "") return alert("Password cannot be empty.");

                                        const error = await editGlobalChannelVisibility(channel.id, !channel.visible, password);
                                        if (error) alert(error);

                                        reload();
                                    }}
                                >
                                    {channel.visible ? <FaEyeSlash /> : <FaEye />}
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={async () => {
                                        const password = channel.hasPassword ? prompt("Enter the current password:")?.trim() : null;
                                        if (password === undefined) return;
                                        if (password === "") return alert("Password cannot be empty.");

                                        const newPassword = prompt("Enter the new password (optional, maximum 128 characters):")?.trim();
                                        if (newPassword === undefined) return;
                                        if (newPassword.length > 128) return alert("Password exceeds maximum length.");

                                        const error = await editGlobalChannelPassword(channel.id, newPassword || null, password);
                                        if (error) alert(error);

                                        reload();
                                    }}
                                >
                                    Edit Password
                                </Button>
                                {channel.logs ? null : (
                                    <Button variant="destructive" onClick={() => alert("Please set this channel's logs using /global logs set.")}>
                                        !
                                    </Button>
                                )}
                                <a href={`/global/channels/${channel.id}`}>
                                    <Button variant="secondary" className="flex items-center gap-2">
                                        <FaWaveSquare /> Diagnose
                                    </Button>
                                </a>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
