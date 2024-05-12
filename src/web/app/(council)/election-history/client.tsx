"use client";

import { FaCheck, FaXmark } from "react-icons/fa6";
import { Panel } from "../../../components/ui/panel";
import { Prose } from "../../../components/ui/prose";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import UserMention from "../../../components/ui/user-mention";

export default function ElectionHistoryClient({
    entries,
    seats,
}: {
    entries: { wave: number; user: string; status: string; rerunning: boolean }[];
    seats: Record<number, number>;
}) {
    const waveMap: Record<number, { user: string; status: string; rerunning: boolean }[]> = {};
    for (const { wave, ...entry } of entries) (waveMap[wave] ??= []).push(entry);

    const waves = Object.entries(waveMap).sort(([a], [b]) => +b - +a);

    return (
        <Prose className="flex flex-col gap-4">
            {waves.map(([wave, entries]) => (
                <Panel key={wave}>
                    <h1>Wave {wave}</h1>
                    <p className="font-semibold">Seats: {seats[+wave] ?? <span className="opacity-50">(unknown)</span>}</p>
                    <Table className="m-0">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Rerunning?</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.map(({ user, status, rerunning }) => (
                                <TableRow key={user}>
                                    <TableCell>
                                        <UserMention id={user} />
                                    </TableCell>
                                    <TableCell>{status.replace(/\b\w/g, (x) => x.toUpperCase())}</TableCell>
                                    <TableCell align="center">{rerunning ? <FaCheck /> : <FaXmark />}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Panel>
            ))}
        </Prose>
    );
}
