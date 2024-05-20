"use client";

import { LineChart } from "@tremor/react";
import { useEffect, useState } from "react";
import { Loading } from "../../../../components/loading";
import { Panel } from "../../../../components/ui/panel";
import { Prose } from "../../../../components/ui/prose";
import TimeMentionFull from "../../../../components/ui/time-mention-full";
import { getMonitor } from "./actions";

export default function Monitor() {
    const [lastUpdate, setLastUpdate] = useState<number>(0);
    const [now, setNow] = useState<number>(Date.now());
    const [upSince, setUpSince] = useState<number>(0);
    const [roleUpdates, setRoleUpdates] = useState<number[]>([]);
    const [staffUpdates, setStaffUpdates] = useState<number[]>([]);
    const [reportUpdates, setReportUpdates] = useState<number[]>([]);
    const [globalTasks, setGlobalTasks] = useState<number[]>([]);

    useEffect(() => {
        getMonitor().then((data) => {
            setLastUpdate(Date.now());
            setUpSince(data.upSince);
            setRoleUpdates(data.roleUpdates);
            setStaffUpdates(data.staffUpdates);
            setReportUpdates(data.reportUpdates);
            setGlobalTasks(data.globalTasks);
        });

        const interval = setInterval(async () => {
            const data = await getMonitor();
            setLastUpdate(Date.now());
            setUpSince(data.upSince);
            setRoleUpdates(data.roleUpdates);
            setStaffUpdates(data.staffUpdates);
            setReportUpdates(data.reportUpdates);
            setGlobalTasks(data.globalTasks);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const elapsed = Math.max(0, (now - lastUpdate) / 1000).toFixed();

    if (lastUpdate === 0) return <Loading>Loading...</Loading>;

    return (
        <Prose>
            <p>
                System up since <TimeMentionFull time={upSince} />. Last updated {elapsed} second{elapsed === "1" ? "" : "s"} ago.
            </p>
            <Panel>
                <div className="prose">
                    <h2>Global Chat Tasks</h2>
                    <LineChart
                        className="h-72"
                        data={globalTasks.map((x) => ({ label: "", "Queue Size": x }))}
                        index="label"
                        categories={["Queue Size"]}
                        colors={["blue"]}
                    />
                </div>
            </Panel>
            <br />
            <Panel>
                <div className="prose">
                    <h2>Role Synchronizaton Queue</h2>
                    <LineChart
                        className="h-72"
                        data={roleUpdates.map((x) => ({ label: "", "Queue Size": x }))}
                        index="label"
                        categories={["Queue Size"]}
                        colors={["blue"]}
                    />
                </div>
            </Panel>
            <br />
            <Panel>
                <div className="prose">
                    <h2>Staff Synchronization Queue</h2>
                    <LineChart
                        className="h-72"
                        data={staffUpdates.map((x) => ({ label: "", "Queue Size": x }))}
                        index="label"
                        categories={["Queue Size"]}
                        colors={["blue"]}
                    />
                </div>
            </Panel>
            <br />
            <Panel>
                <div className="prose">
                    <h2>Network User Reports Action Queue</h2>
                    <LineChart
                        className="h-72"
                        data={reportUpdates.map((x) => ({ label: "", "Queue Size": x }))}
                        index="label"
                        categories={["Queue Size"]}
                        colors={["blue"]}
                    />
                </div>
            </Panel>
        </Prose>
    );
}
