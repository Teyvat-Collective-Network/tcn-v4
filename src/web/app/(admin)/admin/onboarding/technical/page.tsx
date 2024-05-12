import { FaAngleLeft, FaAnglesLeft, FaHashtag } from "react-icons/fa6";
import { Button } from "../../../../../components/ui/button";
import { LandingPage, LandingPanel } from "../../../../../components/ui/landing-page";
import Mention from "../../../../../components/ui/mention";
import { Prose } from "../../../../../components/ui/prose";
import UserMention from "../../../../../components/ui/user-mention";

export default function OnboardingGuideTechnical() {
    return (
        <>
            <Prose>
                <h1>Observer Onboarding &mdash; Technical</h1>
                <div className="flex items-center gap-4">
                    <a href="/admin/onboarding">
                        <Button className="flex items-center gap-2">
                            <FaAnglesLeft /> Return to Onboarding Home
                        </Button>
                    </a>
                    <a href="/admin/onboarding/hub">
                        <Button className="flex items-center gap-2">
                            <FaAngleLeft /> TCN Hub
                        </Button>
                    </a>
                </div>
                <p>
                    All technical features are owned and operated by <UserMention id="251082987360223233" />. Please contact them for any issues or questions.
                </p>
            </Prose>
            <br />
            <LandingPage>
                <LandingPanel href="/admin/onboarding/technical/tickets">
                    <h2>Tickets</h2>
                    <p>Learn how to use the tickets in HQ.</p>
                </LandingPanel>
                <LandingPanel href="/admin/onboarding/technical/modmail">
                    <h2>Modmail</h2>
                    <p>Learn how to use the modmail in the TCN Hub.</p>
                </LandingPanel>
                <LandingPanel href="/admin/onboarding/technical/suggestions">
                    <h2>Suggestions</h2>
                    <p>
                        Learn how to handle suggestions in{" "}
                        <Mention>
                            <FaHashtag /> suggestions
                        </Mention>{" "}
                        in both HQ and the TCN Hub.
                    </p>
                </LandingPanel>
                <LandingPanel href="/admin/onboarding/technical/applications">
                    <h2>Applications</h2>
                    <p>Learn about the application workflow.</p>
                </LandingPanel>
                <LandingPanel href="/admin/onboarding/technical/global">
                    <h2>Global Chat</h2>
                    <p>Learn how to operate/monitor the observer-only features in the global chat system.</p>
                </LandingPanel>
                <LandingPanel href="/admin/onboarding/technical/banshares">
                    <h2>Banshares</h2>
                    <p>Learn how to process banshares.</p>
                </LandingPanel>
                <LandingPanel href="/admin/onboarding/technical/votes">
                    <h2>Votes</h2>
                    <p>Learn how to create and operate votes.</p>
                </LandingPanel>
                <LandingPanel href="/admin/onboarding/technical/elections">
                    <h2>Elections</h2>
                    <p>Learn how to set up and run elections.</p>
                </LandingPanel>
            </LandingPage>
        </>
    );
}
