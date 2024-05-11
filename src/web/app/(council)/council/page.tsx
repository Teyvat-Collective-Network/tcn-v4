import { LandingPage, LandingPanel } from "../../../components/ui/landing-page";

export default function CouncilHome() {
    return (
        <LandingPage>
            <LandingPanel href="/audit-logs">
                <h2>Audit Logs</h2>
                <p>View the audit logs here.</p>
            </LandingPanel>
        </LandingPage>
    );
}
