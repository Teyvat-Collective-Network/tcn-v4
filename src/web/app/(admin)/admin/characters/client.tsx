"use client";

import { useState } from "react";
import { FaPencil, FaPlus, FaTrash } from "react-icons/fa6";
import { Button } from "../../../../components/ui/button";
import { ComboSelector } from "../../../../components/ui/combo-selector";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { addCharacter, changeCharacterId, deleteCharacter, getCharacters, setCharacterElement, setCharacterFullName, setCharacterShortName } from "./actions";

export default function AdminCharactersClient({ characters: initial }: { characters: { id: string; short: string | null; name: string; element: string }[] }) {
    const [characters, setCharacters] = useState(initial);

    async function reload() {
        setCharacters(await getCharacters());
    }

    return (
        <>
            <Table className="w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead />
                        <TableHead>ID</TableHead>
                        <TableHead>Short Name</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Element</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {characters.map((character) => (
                        <TableRow key={character.id}>
                            <TableCell>
                                <Button
                                    variant="secondary"
                                    onClick={async () => {
                                        if (!confirm("Delete character? This cannot be done while there are guilds representing this character.")) return;

                                        const valid = await deleteCharacter(character.id);
                                        if (!valid) return alert("Failed to delete character. This character is probably represented by a guild.");

                                        reload();
                                    }}
                                >
                                    <FaTrash />
                                </Button>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="secondary"
                                        onClick={async () => {
                                            const id = prompt("Enter a new character ID:")?.trim();
                                            if (!id) return;
                                            if (!id.match(/^[a-z-]{1,32}$/))
                                                return alert("Invalid character ID (should be 1-32 lowercase letters and dashes).");
                                            const valid = await changeCharacterId(character.id, id);

                                            if (!valid)
                                                return alert(
                                                    "Failed to change character ID. The character's ID might have already been changed or you are attempting to set it to an ID that is already in use.",
                                                );

                                            reload();
                                        }}
                                    >
                                        <FaPencil />
                                    </Button>
                                    <code>{character.id}</code>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="secondary"
                                        onClick={async () => {
                                            const short = prompt(
                                                "Enter a new short name (maximum 32 characters) or leave blank to remove. This will update partner embeds but not guild role names in HQ/the Hub.",
                                            )?.trim();

                                            if (short === undefined) return;
                                            if (short.length > 32) return alert("Short name is too long (maximum 32 characters).");
                                            const valid = await setCharacterShortName(character.id, short);

                                            if (!valid) return alert("Failed to change character name.");

                                            reload();
                                        }}
                                    >
                                        <FaPencil />
                                    </Button>
                                    {character.short ?? <span className="opacity-50">(none)</span>}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="secondary"
                                        onClick={async () => {
                                            const name = prompt(
                                                "Enter a new name (maximum 64 characters). This will update partner embeds but not guild role names in HQ/the Hub.",
                                            )?.trim();

                                            if (!name) return;
                                            if (name.length > 64) return alert("Name is too long (maximum 64 characters).");
                                            const valid = await setCharacterFullName(character.id, name);

                                            if (!valid) return alert("Failed to change character name.");

                                            reload();
                                        }}
                                    >
                                        <FaPencil />
                                    </Button>
                                    {character.name}
                                </div>
                            </TableCell>
                            <TableCell>
                                <ComboSelector
                                    values={[
                                        { label: "Pyro", value: "pyro" },
                                        { label: "Hydro", value: "hydro" },
                                        { label: "Anemo", value: "anemo" },
                                        { label: "Electro", value: "electro" },
                                        { label: "Dendro", value: "dendro" },
                                        { label: "Cryo", value: "cryo" },
                                        { label: "Geo", value: "geo" },
                                    ]}
                                    value={character.element}
                                    setValue={async (element) => {
                                        if (!element) return;
                                        if (!confirm("Change character element? This will update partner embeds.")) return;

                                        const valid = await setCharacterElement(character.id, element);

                                        if (!valid) return alert("Failed to change character element.");

                                        reload();
                                    }}
                                ></ComboSelector>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <br />
            <Button
                variant="secondary"
                onClick={async () => {
                    const id = prompt("Enter a new character ID:")?.trim();
                    if (!id) return;
                    if (!id.match(/^[a-z-]{1,32}$/)) return alert("Invalid character ID (should be 1-32 lowercase letters and dashes).");

                    const short = prompt("Enter a short name (maximum 32 characters).")?.trim();
                    if (short === undefined) return;
                    if (short.length > 32) return alert("Short name is too long (maximum 32 characters).");

                    const name = prompt("Enter a name (required, maximum 64 characters).")?.trim();
                    if (!name) return;
                    if (name.length > 64) return alert("Name is too long (maximum 64 characters).");

                    const element = prompt("Enter an element.")?.trim()?.toLowerCase();
                    if (!element) return;
                    if (!["pyro", "hydro", "anemo", "electro", "dendro", "cryo", "geo"].includes(element)) return alert("Invalid element.");

                    const valid = await addCharacter(id, short, name, element);
                    if (!valid) return alert("Failed to add character. Check if the ID is duplicated.");

                    reload();
                }}
            >
                <FaPlus />
            </Button>
        </>
    );
}
