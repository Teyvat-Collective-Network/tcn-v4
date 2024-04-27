import { Panel } from "../../../components/ui/panel";

export default function Quickstart() {
    return (
        <div className="grid md:grid-cols-2 gap-2">
            <a href="/quickstart/requirements">
                <Panel className="h-full prose hover:scale-[98%] active:scale-[95%] transition-transform">
                    <h2>Requirements</h2>
                    <p>Just the essentials. This is all that is required of you, and it&apos;s easy to set up, so we recommend starting here.</p>
                </Panel>
            </a>
            <a href="/quickstart/banshares">
                <Panel className="h-full prose hover:scale-[98%] active:scale-[95%] transition-transform">
                    <h2>Banshares</h2>
                    <p>
                        Setting up banshares in your server allows you to receive them there directly and enable automatic banning instead of copy-pasting from
                        HQ each time.
                    </p>
                </Panel>
            </a>
            <a href="/quickstart/global-chat">
                <Panel className="h-full prose hover:scale-[98%] active:scale-[95%] transition-transform">
                    <h2>Global Chat</h2>
                    <p>
                        Connecting to global chat allows your members to chat with members in other TCN servers, and if you connect the staff channels, your
                        staff can also hang out with or reach out to other servers&apos; staff.
                    </p>
                </Panel>
            </a>
            <a href="/quickstart/staff-link">
                <Panel className="h-full prose hover:scale-[98%] active:scale-[95%] transition-transform">
                    <h2>Staff Link</h2>
                    <p>
                        Configuring the staff link allows you to automatically sync your server&apos;s staff with the TCN system, allowing them to receive
                        access roles in the TCN Hub and gain permission to submit banshares.
                    </p>
                </Panel>
            </a>
            <a href="/quickstart/other-bots">
                <Panel className="h-full prose hover:scale-[98%] active:scale-[95%] transition-transform">
                    <h2>Other Bots</h2>
                    <p>
                        There are some other bots (Genshin Wizard, Daedalus) that you might be interested in using. Both are partnered with us, and you can get
                        special benefits through our partnership terms.
                    </p>
                </Panel>
            </a>
        </div>
    );
}
