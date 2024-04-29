import { LandingPage, LandingPanel } from "../../../components/ui/landing-page";

export default function Documentation() {
    return (
        <LandingPage>
            <LandingPanel href="/docs/autosync">
                    <h2>Autosync</h2>
                    <p>
                        Autosync allows you to keep your server&apos;s TCN partner list automatically updated. This section documents its configuration settings
                        and additional commands.
                    </p>
            </LandingPanel>
            <LandingPanel href="/docs/banshares">
                    <h2>Banshares</h2>
                    <p>This section contains the banshare philosophy, submission guide, and lifecycle information section.</p>
            </LandingPanel>
            <LandingPanel href="/docs/global-chat">
                    <h2>Global Chat</h2>
                    <p>
                        This section contains administrative information on operating global chat, information for appointed and general network moderators, and
                        any other relevant public information.
                    </p>
            </LandingPanel>
            <LandingPanel href="/docs/glossary">
                    <h2>Glossary</h2>
                    <p>Wondering what a term means? Refer to the glossary for a reference of terminology used across the network.</p>
            </LandingPanel>
            <LandingPanel href="/docs/global-chat-rules">
                    <h2>Global Chat Rules</h2>
                    <p>These are the rules for the general public global channel.</p>
            </LandingPanel>
            <LandingPanel href="/docs/exit-procedure">
                    <h2>Exit Procedure</h2>
                    <p>
                        Sometimes servers choose to leave the network or things don&apos;t work out for whatever reason. No matter what, we want to ensure a
                        smooth process, so this section details how to take down everything in the most convenient way possible.
                    </p>
            </LandingPanel>
            </LandingPage>
    );
}
