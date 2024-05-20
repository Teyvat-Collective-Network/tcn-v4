"use server";

import { Prose } from "../../../components/ui/prose";
import { getId } from "../../../lib/get-user";
import { api } from "../../../lib/trpc";
import ReportFormClient from "./client";
import ReportQuiz from "./quiz";

export default async function ReportForm() {
    const user = await getId();
    if (!user) return;

    const guilds = await api.getGuildsForReports.query(user);
    if (guilds.length === 0)
        return (
            <Prose>
                <p>
                    You do not have permission to submit network user reports from any servers. If you believe this is a mistake, direct your server owner to
                    the{" "}
                    <a href="/quickstart/staff-link" className="link">
                        staff link quickstart page
                    </a>{" "}
                    or{" "}
                    <a href="/contact" className="link">
                        contact us
                    </a>
                    .
                </p>
            </Prose>
        );

    const passed = await api.hasPassedReportQuiz.query(user);
    if (!passed) return <ReportQuiz />;

    return <ReportFormClient guilds={guilds} />;
}
