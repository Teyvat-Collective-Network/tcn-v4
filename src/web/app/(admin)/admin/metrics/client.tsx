"use client";

import { useState } from "react";
import { FaChevronDown, FaChevronUp, FaMinus } from "react-icons/fa6";
import { Prose } from "../../../../components/ui/prose";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";

export default function AdminMetricsClient({ metrics }: { metrics: { key: string; averageDuration: number; count: number; errorRate: number }[] }) {
    const [sorted, setSorted] = useState<typeof metrics>(metrics);
    const [sortKey, setSortKey] = useState<"averageDuration" | "count" | "errorRate">("averageDuration");
    const [sortDir, setSortDir] = useState<boolean>(false);

    return (
        <Prose>
            <h1>Metrics</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>
                            <div
                                className="inline-flex items-center gap-2 cursor-default whitespace-nowrap"
                                onClick={() => (sortKey === "averageDuration" ? setSortDir((x) => !x) : (setSortKey("averageDuration"), setSortDir(false)))}
                            >
                                Average Duration
                                {sortKey === "averageDuration" ? sortDir ? <FaChevronDown /> : <FaChevronUp /> : <FaMinus />}
                            </div>
                        </TableHead>
                        <TableHead>
                            <div
                                className="inline-flex items-center gap-2 cursor-default whitespace-nowrap"
                                onClick={() => (sortKey === "count" ? setSortDir((x) => !x) : (setSortKey("count"), setSortDir(false)))}
                            >
                                Count
                                {sortKey === "count" ? sortDir ? <FaChevronDown /> : <FaChevronUp /> : <FaMinus />}
                            </div>
                        </TableHead>
                        <TableHead>
                            <div
                                className="inline-flex items-center gap-2 cursor-default whitespace-nowrap"
                                onClick={() => (sortKey === "errorRate" ? setSortDir((x) => !x) : (setSortKey("errorRate"), setSortDir(false)))}
                            >
                                Error Rate
                                {sortKey === "errorRate" ? sortDir ? <FaChevronDown /> : <FaChevronUp /> : <FaMinus />}
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sorted
                        .sort((x, y) => (sortDir ? x[sortKey] - y[sortKey] : y[sortKey] - x[sortKey]))
                        .map((row) => (
                            <TableRow key={row.key}>
                                <TableCell>
                                    <code>{row.key}</code>
                                </TableCell>
                                <TableCell>
                                    <code>{row.averageDuration}</code>
                                </TableCell>
                                <TableCell>
                                    <code>{row.count}</code>
                                </TableCell>
                                <TableCell>
                                    <code>{(row.errorRate * 100).toFixed(2)}%</code>{" "}
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </Prose>
    );
}
