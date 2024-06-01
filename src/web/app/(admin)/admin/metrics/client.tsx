"use client";

import { BarChart, LineChart } from "@tremor/react";
import { useEffect, useState } from "react";
import { FaChartLine, FaChevronDown, FaChevronLeft, FaChevronUp, FaMinus } from "react-icons/fa6";
import { Loading } from "../../../../components/loading";
import { Button } from "../../../../components/ui/button";
import { Prose } from "../../../../components/ui/prose";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { getMetricsChart } from "./actions";

export default function AdminMetricsClient({ metrics }: { metrics: { key: string; averageDuration: number; count: number; errorRate: number }[] }) {
    const [sortKey, setSortKey] = useState<"averageDuration" | "count" | "errorRate">("averageDuration");
    const [sortDir, setSortDir] = useState<boolean>(false);
    const [key, setKey] = useState<string | null>(null);
    const [data, setData] = useState<{ duration: number; errored: boolean }[] | null>(null);

    useEffect(() => {
        if (key === null) {
            setData(null);
            return;
        }

        getMetricsChart(key)
            .then(setData)
            .catch(() => alert(`Failed to load data for key: ${key}`));
    }, [key, setData]);

    if (key)
        return (
            <div className="prose">
                <h1>Metrics</h1>
                <div className="flex items-center gap-4">
                    <Button variant="secondary" className="flex items-center gap-2" onClick={() => setKey(null)}>
                        <FaChevronLeft /> Back
                    </Button>
                    <span>
                        <code>{key}</code> (past 100)
                    </span>
                </div>
                <br />
                {data === null ? (
                    <Loading>Loading metrics...</Loading>
                ) : (
                    <LineChart
                        className="h-72"
                        data={data.map((x) => ({ label: "", Duration: x.duration }))}
                        index="label"
                        categories={["Duration"]}
                        colors={["blue"]}
                    />
                )}
                <br />
                {data === null ? null : (
                    <BarChart
                        className="h-72"
                        data={data.map((x) => ({ label: "", Errored: x.errored ? 1 : 0 }))}
                        index="label"
                        categories={["Errored"]}
                        colors={["red"]}
                    />
                )}
            </div>
        );

    return (
        <Prose>
            <h1>Metrics</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead />
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
                    {metrics
                        .sort((x, y) => (sortDir ? x[sortKey] - y[sortKey] : y[sortKey] - x[sortKey]))
                        .map((row) => (
                            <TableRow key={row.key}>
                                <TableCell>
                                    <FaChartLine onClick={() => setKey(row.key)} />
                                </TableCell>
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
