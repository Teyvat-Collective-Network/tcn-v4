"use server";

import { Panel } from "../../../components/ui/panel";
import { Prose } from "../../../components/ui/prose";
import { getId } from "../../../lib/get-user";
import { trpc } from "../../../lib/trpc";
import BanshareClient from "./client";

export default async function Banshare() {
    const id = await getId();
    if (!id) return <></>;

    const servers = await trpc.getUserStaffedServers.query(id);
    if (servers.length === 0)
        return (
            <Prose>
                <Panel>
                    <p>
                        You do not seem to be staff in any TCN servers. If this is a mistake, please contact your server&apos;s owner and refer them to{" "}
                        <a href="/quickstart/staff-link" className="link">
                            this page
                        </a>{" "}
                        or contact an osberver.
                    </p>
                </Panel>
            </Prose>
        );

    return <BanshareClient servers={servers.sort((x, y) => x.name.toLowerCase().localeCompare(y.name.toLowerCase()))}></BanshareClient>;
}
