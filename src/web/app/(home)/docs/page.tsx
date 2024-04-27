import { Panel } from "../../../components/ui/panel";

export default function Documentation() {
    return (
        <div className="grid md:grid-cols-2 gap-2">
            <a href="/docs/autosync">
                <Panel className="h-full prose hover:scale-[98%] active:scale-[95%] transition-transform">
                    <h2>Autosync</h2>
                    <p>
                        Autosync allows you to keep your server&apos;s TCN partner list automatically updated. This section documents its configuration settings
                        and additional commands.
                    </p>
                </Panel>
            </a>
            <a href="/docs/banshares">
                <Panel className="h-full prose hover:scale-[98%] active:scale-[95%] transition-transform">
                    <h2>Banshares</h2>
                    <p>This section contains the banshare philosophy, submission guide, and lifecycle information section.</p>
                </Panel>
            </a>
            <a href="/docs/global-chat">
                <Panel className="h-full prose hover:scale-[98%] active:scale-[95%] transition-transform">
                    <h2>Global Chat</h2>
                    <p>
                        This section contains administrative information on operating global chat, information for appointed and general network moderators, and
                        any other relevant public information.
                    </p>
                </Panel>
            </a>
            <a href="/docs/glossary">
                <Panel className="h-full prose hover:scale-[98%] active:scale-[95%] transition-transform">
                    <h2>Glossary</h2>
                    <p>Wondering what a term means? Refer to the glossary for a reference of terminology used across the network.</p>
                </Panel>
            </a>
            <a href="/docs/global-chat-rules">
                <Panel className="h-full prose hover:scale-[98%] active:scale-[95%] transition-transform">
                    <h2>Global Chat Rules</h2>
                    <p>These are the rules for the general public global channel.</p>
                </Panel>
            </a>
            <a href="/quickstart/exit-procedure">
                <Panel className="h-full prose hover:scale-[98%] active:scale-[95%] transition-transform">
                    <h2>Exit Procedure</h2>
                    <p>
                        Sometimes servers choose to leave the network or things don&apos;t work out for whatever reason. No matter what, we want to ensure a
                        smooth process, so this section details how to take down everything in the most convenient way possible.
                    </p>
                </Panel>
            </a>
        </div>
    );
}
