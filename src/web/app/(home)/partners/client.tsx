"use client";

import Image from "next/image";
import { useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Panel } from "../../../components/ui/panel";
import { Switch } from "../../../components/ui/switch";
import { fuzzy } from "../../../lib/fuzzy";

export default function PartnersClient({ servers }: { servers: { id: string; mascot: string; name: string; invite: string; image: string }[] }) {
    const [showExternal, setShowExternal] = useState<boolean>(false);
    const [query, setQuery] = useState<string>("");

    return (
        <>
            <div className="prose">
                <h1>Our Members &amp; Partners</h1>
                <p>The TCN has member servers and external third-party partners with which we exchange mutual benefits.</p>
                <p>
                    Note that the TCN has <u>no restriction</u> on how many servers may join for one character! We encourage you to apply even if we already
                    have a server for your server&apos;s character and have had &quot;duplicate servers&quot; peacefully co-exist before.
                </p>
                <div className="flex items-center gap-4">
                    <p>Show TCN members</p>
                    <Switch checked={showExternal} onCheckedChange={setShowExternal} />
                    <p>Show External Partners</p>
                </div>
            </div>
            <hr />
            <br />
            {showExternal ? (
                <>
                    <Panel className="flex items-center gap-8">
                        <Image
                            src="https://genshinwizard.com/wp-content/uploads/2022/09/cropped-genshinwizard_logo-192x192.png"
                            alt="Genshin Wizard Icon"
                            width={180}
                            height={180}
                            className="rounded"
                        />
                        <div className="flex flex-col gap-2 prose">
                            <h2>Genshin Wizard</h2>
                            <p>The TCN is partnered with Genshin Wizard, a multi-purpose Genshin Impact utility bot. Check out their website below!</p>
                            <a href="https://genshinwizard.com">
                                <Button>Website</Button>
                            </a>
                        </div>
                    </Panel>
                    <br />
                    <Panel className="flex items-center gap-8">
                        <Image src="https://i.imgur.com/pwzRnxW.png" alt="Genshin Impact Tavern Icon" width={180} height={180} className="rounded" />
                        <div className="flex flex-col gap-2 prose">
                            <h2>Genshin Impact Tavern</h2>
                            <p>
                                The TCN is partnered with Genshin Impact Tavern, a multifaceted Discord Community Server for Genshin Impact! Check out their
                                RPG-like experience through a custom bot, which lets you earn Mora that can be used to redeem official merchandise, their
                                Cat&apos;s Tail Gathering TCG tournament, and more! <i>Genshin Impact Tavern is an officially endorsed server.</i>
                            </p>
                            <a href="https://discord.gg/genshinimpacttavern">
                                <Button>Join Server</Button>
                            </a>
                        </div>
                    </Panel>
                    <br />
                    <Panel className="flex items-center gap-8">
                        <Image src="https://daedalusbot.xyz/favicon.ico" alt="Daedalus Icon" width={180} height={180} className="rounded" />
                        <div className="flex flex-col gap-2 prose">
                            <h2>Daedalus</h2>
                            <p>
                                The TCN is partnered with Daedalus, a general-purpose Discord bot that offers a high-quality server management experience. TCN
                                servers get free access to the custom client feature. Check out its website below for more information!
                            </p>
                            <a href="https://daedalusbot.xyz">
                                <Button>Website</Button>
                            </a>
                        </div>
                    </Panel>
                </>
            ) : (
                <>
                    <div className="flex items-center gap-4">
                        <FaMagnifyingGlass />
                        <Input placeholder="Filter Servers" value={query} onChange={({ currentTarget: { value } }) => setQuery(value)} />
                    </div>
                    <br />
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(360px,100%),1fr))] gap-2">
                        {servers
                            .filter(({ mascot, name }) => fuzzy(mascot, query) || fuzzy(name, query))
                            .map(({ id, name, invite, image }) => (
                                <Panel key={id} className="flex items-center gap-8">
                                    <Image className="rounded-full" src={image} alt={`${name} Icon`} width={100} height={100} />
                                    <div className="flex flex-col gap-2">
                                        <a href={`/server/${id}`} className="link text-xl font-semibold">
                                            {name}
                                        </a>
                                        <a href={`https://discord.gg/${invite}`} target="_blank">
                                            <Button>Join</Button>
                                        </a>
                                    </div>
                                </Panel>
                            ))}
                    </div>
                </>
            )}
        </>
    );
}
