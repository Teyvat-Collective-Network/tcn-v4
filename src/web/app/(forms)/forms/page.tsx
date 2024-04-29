import { LandingPage, LandingPanel } from "../../../components/ui/landing-page";

export default function FormsHome() {
    return (
        <LandingPage>
            <LandingPanel href="/apply">
                <h2>Apply</h2>
                <p>Apply here to join the TCN!</p>
            </LandingPanel>
            <LandingPanel href="/banshare">
                <h2>Banshare Form</h2>
                <p>Submit banshares here (you must be a staff member in a TCN server).</p>
            </LandingPanel>
            <LandingPanel href="/global-ban-appeal">
                <h2>Global Ban Appeal</h2>
                <p>Appeal your global chat ban here.</p>
            </LandingPanel>
            <LandingPanel href="/banshare-appeal">
                <h2>Banshare Appeal</h2>
                <p>If you&apos;ve been banshared in the TCN, you may appeal it here.</p>
            </LandingPanel>
        </LandingPage>
    );
}
