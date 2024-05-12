import { LandingPage, LandingPanel } from "../../../components/ui/landing-page";

export default function AdminHome() {
    return (
        <LandingPage>
            <LandingPanel href="/admin/onboarding">
                <h2>Onboarding Guide</h2>
                <p>New to the team or want to review our procedures? Check out the observer onboarding guide.</p>
            </LandingPanel>
            <LandingPanel href="/admin/observation-guide">
                <h2>Observation Guide</h2>
                <p>Check out this guide for some tips and advice on conducting observations.</p>
            </LandingPanel>
            <LandingPanel href="/admin/monitor">
                <h2>Monitor</h2>
                <p>Monitor the network infrastructure&apos;s operation.</p>
            </LandingPanel>
            <LandingPanel href="/admin/servers">
                <h2>Manage Servers</h2>
            </LandingPanel>
            <LandingPanel href="/admin/users">
                <h2>Manage Users</h2>
            </LandingPanel>
            <LandingPanel href="/admin/vote-tracker">
                <h2>Vote Tracker</h2>
                <p>View users&apos; voting history here.</p>
            </LandingPanel>
        </LandingPage>
    );
}
