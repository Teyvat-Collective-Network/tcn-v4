"use server";

import { Panel } from "../../components/ui/panel";
import { trpc } from "../../lib/trpc";

export default async function Home() {
    const count = await trpc.getServerCount.query();

    return (
        <div className="grid gap-4 lg:grid-cols-10">
            <Panel className="lg:col-span-4 px-8 py-12 text-4xl font-semibold flex items-center">Welcome to the Teyvat Collective Network!</Panel>
            <Panel highlight className="lg:col-span-6 px-8 py-12 text-2xl flex items-center">
                The mission of the TCN is to unite all mains servers across Teyvat and provide support and promote collaboration between partners.
            </Panel>
            <Panel className="lg:col-span-5 px-8 py-12 text-xl flex items-center">
                The TCN is a network of {count} high-quality Genshin Impact Discord server{count === 1 ? "" : "s"} that are dedicated to fostering Mains-style
                fan communities.
            </Panel>
            <Panel className="lg:col-span-5 px-8 py-12 text-xl flex flex-col items-center gap-4">
                <div>Do you own a Discord server dedicated to a playable Genshin Impact character and want to join the TCN? Apply here!</div>
                <div>
                    <a href="/join" className="p-2 rounded bg-hl">
                        Apply To Join
                    </a>
                </div>
            </Panel>
        </div>
    );
}
