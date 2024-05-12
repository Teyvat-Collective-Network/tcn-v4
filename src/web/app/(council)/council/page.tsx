import { LandingPage, LandingPanel } from "../../../components/ui/landing-page";

export default function CouncilHome() {
    return (
        <LandingPage>
            <LandingPanel href="/audit-logs">
                <h2>Audit Logs</h2>
                <p>View the audit logs here.</p>
            </LandingPanel>
            <LandingPanel href="/observer-terms">
                <h2>Observer Terms</h2>
                <p>View the list of observers and their current term start and end dates here.</p>
            </LandingPanel>
            <LandingPanel href="/election-history">
                <h2>Election History</h2>
                <p>View the history of elections here.</p>
            </LandingPanel>
        </LandingPage>
    );
}
