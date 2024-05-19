"use client";

import { useState } from "react";
import { FaPencil, FaPlus, FaRotateRight, FaTrash } from "react-icons/fa6";
import { Loading } from "../../../../../components/loading";
import { Button } from "../../../../../components/ui/button";
import { ComboSelector } from "../../../../../components/ui/combo-selector";
import { Prose } from "../../../../../components/ui/prose";
import { Switch } from "../../../../../components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../components/ui/table";
import {
    addTermToFilter,
    createFilter,
    deleteFilter,
    deleteFilterTerm,
    editFilterTermRegex,
    editFilterTermTerm,
    getFilter,
    getFilters,
    renameFilter,
} from "./actions";

export default function GlobalFiltersClient({ filters: initial }: { filters: { id: number; name: string }[] }) {
    const [filters, setFilters] = useState(initial);
    const [id, setId] = useState<number | null>(null);
    const [filter, setFilter] = useState<{ id: number; term: string; regex: boolean }[] | null>(null);

    async function reload() {
        const filters = await getFilters();
        setFilters(filters);

        if (id)
            if (filters.some((f) => f.id === id)) setFilter(await getFilter(id));
            else {
                setId(null);
                setFilter(null);
            }
    }

    return (
        <>
            <div className="flex items-center gap-4">
                <ComboSelector
                    values={filters.map((f) => ({ label: f.name, value: `${f.id}` }))}
                    value={id?.toString() ?? null}
                    setValue={async (input) => {
                        if (input === null) return;

                        setId(+input);

                        setFilter(null);

                        setFilter(
                            await getFilter(+input).catch(() => {
                                alert("Failed to load filter. Please reload the data.");
                                return null;
                            }),
                        );
                    }}
                ></ComboSelector>
                <Button variant="secondary" onClick={reload}>
                    <FaRotateRight />
                </Button>
                <Button
                    variant="secondary"
                    onClick={async () => {
                        const name = prompt("Enter the name of the new filter")?.trim();

                        if (!name) return;
                        if (name.length > 80) return alert("Filter name is too long (max 80 characters).");

                        const error = await createFilter(name);
                        if (error) return alert(error);

                        reload();
                    }}
                >
                    <FaPlus />
                </Button>
            </div>
            <hr className="my-8" />
            {id === null || filter === null ? (
                <Loading>Loading...</Loading>
            ) : (
                <>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="secondary"
                            onClick={async () => {
                                if (!confirm("Are you sure you want to delete this filter? It will be removed from all channels currently using it, if any."))
                                    return;

                                const error = await deleteFilter(id);
                                if (error) alert(error);

                                reload();
                            }}
                        >
                            Delete Filter
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={async () => {
                                const name = prompt("Enter the new name of the filter")?.trim();

                                if (!name) return;
                                if (name.length > 80) return alert("Filter name is too long (max 80 characters).");

                                const error = await renameFilter(id, name);
                                if (error) return alert(error);

                                reload();
                            }}
                        >
                            Rename Filter
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={async () => {
                                let regex: boolean;

                                do {
                                    const input = prompt('Create a regex term or a standard term? (Enter one of "regex" or "standard".)')?.trim();
                                    if (input === undefined) return;
                                    if (input !== "regex" && input !== "standard") continue;
                                    regex = input === "regex";
                                    break;
                                } while (true);

                                let term: string | undefined;

                                do {
                                    term = prompt(
                                        `Enter the term to add to the filter. This will be case-insensitive. ${
                                            regex
                                                ? ""
                                                : "A leading or trailing asterisk acts as a wildcard. The term will only match if it is at a word boundary otherwise."
                                        }`,
                                    )?.trim();

                                    if (term === undefined) return;

                                    if (regex)
                                        try {
                                            new RegExp(term);
                                        } catch {
                                            alert("Invalid regex.");
                                            continue;
                                        }
                                    else if (term.replace(/(^\*|\*$)/g, "").length < 3) {
                                        alert("Invalid term (must contain at least three characters besides wildcards).");
                                        continue;
                                    }

                                    break;
                                } while (true);

                                const error = await addTermToFilter(id, term, regex);
                                if (error) alert(error);

                                reload();
                            }}
                        >
                            New Term
                        </Button>
                    </div>
                    <br />
                    <Prose>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Term</TableHead>
                                    <TableHead>Mode</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filter.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <code>{item.term}</code>
                                        </TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            Standard
                                            <Switch
                                                checked={item.regex}
                                                onCheckedChange={async (regex) => {
                                                    if (regex)
                                                        try {
                                                            new RegExp(item.term);
                                                        } catch {
                                                            alert("Invalid regex. This term cannot be converted to a regex match.");
                                                            return;
                                                        }

                                                    if (!confirm("Are you sure you want to change the term mode?")) return;

                                                    const error = await editFilterTermRegex(item.id, regex);
                                                    if (error) alert(error);

                                                    reload();
                                                }}
                                            ></Switch>
                                            Regex
                                            <Button
                                                variant="secondary"
                                                onClick={async () => {
                                                    const term = prompt("Enter the new term for the filter.")?.trim();
                                                    if (!term) return;

                                                    if (item.regex)
                                                        try {
                                                            new RegExp(term);
                                                        } catch {
                                                            alert("Invalid regex.");
                                                            return;
                                                        }

                                                    const error = await editFilterTermTerm(item.id, term);
                                                    if (error) alert(error);

                                                    reload();
                                                }}
                                            >
                                                <FaPencil />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={async () => {
                                                    if (!confirm("Are you sure you want to delete this term?")) return;

                                                    const error = await deleteFilterTerm(item.id);
                                                    if (error) alert(error);

                                                    reload();
                                                }}
                                            >
                                                <FaTrash />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Prose>
                </>
            )}
        </>
    );
}
