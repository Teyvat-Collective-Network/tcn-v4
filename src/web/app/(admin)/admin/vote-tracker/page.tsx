"use server";

import { FaCheck, FaMinus, FaXmark } from "react-icons/fa6";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import UserMention from "../../../../components/ui/user-mention";
import { api } from "../../../../lib/trpc";

export default async function VoteTracker() {
    const data = await api.getVoteTracker.query();

    const ids = Object.keys(data).sort((a, b) => +b - +a);
    const reversed = ids.toReversed();
    const users = new Set<string>();

    for (const column of Object.values(data)) for (const user of Object.keys(column)) users.add(user);

    const scores: Record<string, number> = Object.fromEntries([...users].map((user) => [user, 0]));

    for (const user of users)
        for (const id of reversed) {
            const voted = data[+id][user];

            if (voted === true) scores[user] *= 0.8;
            else if (voted === false) scores[user] = 0.6 * scores[user] + 0.4;
        }

    return (
        <div className="prose max-w-full">
            <Table className="w-max">
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead className="whitespace-nowrap">Absence Score</TableHead>
                        {ids.map((id) => (
                            <TableHead key={id}>{id}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...users]
                        .sort((x, y) => scores[y] - scores[x])
                        .map((user) => (
                            <TableRow key={user}>
                                <TableCell>
                                    <UserMention id={user} />
                                </TableCell>
                                <TableCell>
                                    <code>{scores[user].toFixed(2)}</code>
                                </TableCell>
                                {ids.map((id) => (
                                    <TableCell key={id}>
                                        {data[+id][user] === true ? (
                                            <FaCheck color="#00bb00" />
                                        ) : data[+id][user] === false ? (
                                            <FaXmark color="red" />
                                        ) : (
                                            <FaMinus color="grey" />
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
