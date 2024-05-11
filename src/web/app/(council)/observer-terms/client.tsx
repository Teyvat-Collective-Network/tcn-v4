"use client";

import { Prose } from "../../../components/ui/prose";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import TimeMention from "../../../components/ui/time-mention";
import UserMention from "../../../components/ui/user-mention";

export default function ObserverTermsClient({ observers }: { observers: { id: string; observerSince: number }[] }) {
    return (
        <Prose>
            <h1>Observer Terms</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Observer</TableHead>
                        <TableHead>Term Start</TableHead>
                        <TableHead>Term End</TableHead>
                        <TableHead>Re-Election Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {observers.map((observer) => {
                        const end = new Date(observer.observerSince);
                        end.setMonth(end.getMonth() + 6);

                        const election = new Date(end);
                        election.setDate(election.getDate() - 9);

                        return (
                            <TableRow key={observer.id}>
                                <TableCell className="flex items-center gap-4">
                                    <UserMention id={observer.id}></UserMention>
                                </TableCell>
                                <TableCell>
                                    <TimeMention time={observer.observerSince}></TimeMention>
                                </TableCell>
                                <TableCell>
                                    <TimeMention time={end}></TimeMention>
                                </TableCell>
                                <TableCell>
                                    <TimeMention time={election}></TimeMention>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Prose>
    );
}
