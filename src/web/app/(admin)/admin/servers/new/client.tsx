"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RgbColorPicker } from "react-colorful";
import { FaPencil, FaPlus } from "react-icons/fa6";
import { hex } from "wcag-contrast";
import { Button } from "../../../../../components/ui/button";
import { ComboSelector } from "../../../../../components/ui/combo-selector";
import { Input } from "../../../../../components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../../components/ui/popover";
import { Switch } from "../../../../../components/ui/switch";
import UserMention from "../../../../../components/ui/user-mention";
import { addGuild } from "./actions";

export default function AdminServersNewClient({
    characters,
    ...initial
}: Partial<{
    id: string;
    mascot: string;
    name: string;
    invite: string;
    owner: string;
    advisor: string;
    delegated: boolean;
    roleColor: number;
    roleName: string;
}> & {
    characters: { id: string; short: string | null; name: string }[];
}) {
    const router = useRouter();

    const [id, setId] = useState<string>(initial.id ?? "");
    const [mascot, setMascot] = useState<string | null>(initial.mascot ?? null);
    const [name, setName] = useState<string>(initial.name ?? "");
    const [invite, setInvite] = useState<string>(initial.invite ?? "");
    const [owner, setOwner] = useState<string>(initial.owner ?? "");
    const [advisor, setAdvisor] = useState<string>(initial.advisor ?? "");
    const [delegated, setDelegated] = useState<boolean>(initial.delegated ?? false);

    const [rgb, setRGB] = useState({
        r: ((initial.roleColor ?? 0) >> 16) & 0xff,
        g: ((initial.roleColor ?? 0) >> 8) & 0xff,
        b: (initial.roleColor ?? 0) & 0xff,
    });

    const [touuchedRoleName, setTouchedRoleName] = useState<boolean>(false);
    const [roleName, setRoleName] = useState<string>(initial.roleName ?? "");

    const roleColor = (rgb.r << 16) | (rgb.g << 8) | rgb.b;
    const hexString = `#${roleColor.toString(16).padStart(6, "0")}`;

    const [submitting, setSubmitting] = useState<boolean>(false);

    return (
        <>
            <div className="grid grid-cols-[max-content_1fr] items-center gap-4">
                <b>ID:</b>
                <Input className="font-mono" placeholder="Server ID" value={id} onChange={({ currentTarget: { value } }) => setId(value)} />
                <b>Mascot:</b>
                <div className="flex items-center gap-4">
                    <ComboSelector
                        values={characters.map((char) => ({ label: char.name, value: char.id }))}
                        value={mascot}
                        setValue={(mascot) => {
                            setMascot(mascot);

                            if (!touuchedRoleName) {
                                const character = characters.find((char) => char.id === mascot);
                                if (character) setRoleName(character.short ?? character.name);
                            }
                        }}
                    />
                    <a href="/admin/characters">
                        <Button variant="secondary" className="flex items-center gap-2">
                            <FaPlus /> Create
                        </Button>
                    </a>
                </div>
                <b>Name:</b>
                <Input placeholder="Server Name" value={name} onChange={({ currentTarget: { value } }) => setName(value)} maxLength={80} />
                <b>Invite:</b>
                <Input placeholder="Invite" value={invite} onChange={({ currentTarget: { value } }) => setInvite(value)} />
                <b>Owner:</b>
                <div className="flex items-center gap-4">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            const owner = prompt("Enter the owner's user ID:");
                            if (owner)
                                if (owner.match(/^[1-9][0-9]{16,19}$/)) setOwner(owner);
                                else alert("Invalid user ID.");
                        }}
                    >
                        <FaPencil />
                    </Button>
                    {owner ? <UserMention id={owner} /> : <span className="opacity-50">(none)</span>}
                </div>
                <b>Advisor:</b>
                <div className="flex items-center gap-4">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            const advisor = prompt("Enter the advisor's user ID (leave empty to remove):");
                            if (advisor !== null)
                                if (advisor)
                                    if (advisor.match(/^([1-9][0-9]{16,19})?$/)) setAdvisor(advisor);
                                    else alert("Invalid user ID.");
                        }}
                    >
                        <FaPencil />
                    </Button>
                    {advisor ? <UserMention id={advisor} /> : <span className="opacity-50">(none)</span>}
                </div>
                <b>Delegated:</b>
                <div className="flex items-center gap-4">
                    Owner
                    <Switch checked={!!advisor && delegated} disabled={!advisor} onCheckedChange={setDelegated} />
                    Advisor
                </div>
                <b>HQ/Hub Role Color:</b>
                <div className="flex items-center gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="secondary">
                                <FaPencil />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <RgbColorPicker color={rgb} onChange={setRGB} />
                        </PopoverContent>
                    </Popover>
                    <div className="w-9 h-9 rounded-md border" style={{ backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }} />
                    {hexString}
                    <span className="text-[#ff0000]">
                        {hex("#ffffff", hexString) < 2.5
                            ? hex("#323338", hexString) < 2.5
                                ? "This color is unsuitable in both light and dark mode."
                                : "This color is too bright for light mode."
                            : hex("#323338", hexString) < 2.5
                              ? "This color is too dark for dark mode."
                              : ""}
                    </span>
                </div>
                <b>HQ/Hub Role Name:</b>
                <Input
                    placeholder="Role Name"
                    value={roleName}
                    onChange={({ currentTarget: { value } }) => {
                        setRoleName(value);
                        setTouchedRoleName(true);
                    }}
                    maxLength={80}
                />
            </div>
            <br />
            <Button
                disabled={submitting}
                onClick={async () => {
                    setSubmitting(true);

                    try {
                        if (!id.trim().match(/^[1-9][0-9]{16,19}$/)) return alert("Invalid guild ID.");
                        if (!mascot) return alert("Enter the guild's mascot.");
                        if (!owner) return alert("Enter the guild's owner.");
                        if (!name.trim()) return alert("Enter the guild's name.");
                        if (!roleName.trim()) return alert("Enter the guild's internal role name.");

                        const error = await addGuild(id, mascot, name, invite, owner, advisor || null, delegated, roleColor, roleName);
                        if (error) return alert(error);

                        router.push("/admin/servers");
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                Add Guild
            </Button>
        </>
    );
}
