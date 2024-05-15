"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash, FaPencil, FaPlus, FaTrash } from "react-icons/fa6";
import { Button } from "../../../../../components/ui/button";
import { Prose } from "../../../../../components/ui/prose";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../components/ui/table";
import { createChannel, deleteChannel, editGlobalChannelName, editGlobalChannelPassword, editGlobalChannelVisibility, getChannels } from "./actions";

export default function GlobalChannelsClient({
    channels: initial,
}: {
    channels: { id: number; name: string; visible: boolean; protected: boolean; hasPassword: boolean; logs: string | null }[];
}) {
    const [channels, setChannels] = useState(initial);

    async function reload() {
        const channels = await getChannels();
        setChannels(channels);
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
        <Prose>
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
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Channel Name</TableHead>
                        <TableHead>Visibility</TableHead>
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

                                        const password = channel.hasPassword ? prompt("Enter your password:")?.trim() : null;
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
                            <TableCell className="flex items-center gap-4">
                                <Button
                                    variant="secondary"
                                    disabled={channel.protected}
                                    onClick={async () => {
                                        if (!confirm("Are you sure you want to delete this channel?")) return;

                                        const password = channel.hasPassword ? prompt("Enter your password:")?.trim() : null;
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

                                        const password = channel.hasPassword ? prompt("Enter your password:")?.trim() : null;
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
                                {channel.logs ? null : <Button variant="destructive" onClick={() => alert("Please set this channel's logs using /global logs set.")}>!</Button>}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Prose>
    );
}
