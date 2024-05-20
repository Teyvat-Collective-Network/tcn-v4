import { FaAngleLeft, FaAngleRight, FaAnglesLeft } from "react-icons/fa6";
import { Button } from "../../../../components/ui/button";
import { Prose } from "../../../../components/ui/prose";

export default function QuickstartNetworkUserReports() {
    return (
        <Prose>
            <h1>Quickstart &mdash; Network User Reports</h1>
            <div className="flex items-center gap-4">
                <a href="/quickstart">
                    <Button className="flex items-center gap-2">
                        <FaAnglesLeft /> Return to Quickstart Home
                    </Button>
                </a>
                <a href="/quickstart/requirements">
                    <Button className="flex items-center gap-2">
                        <FaAngleLeft /> Requirements
                    </Button>
                </a>
            </div>
            <p>
                Network user reports are our way of sharing information on problematic users so you can eliminate potential threats or disturbances before they
                appear in your server. You are not required to take any specific action on users who have been reported &mdash; the purpose is simply to provide
                you with information for you to use as you see fit.
            </p>
            <p>
                To submit a report, visit the{" "}
                <a href="/report" className="link">
                    report form
                </a>
                .
            </p>
            <h2>Setup</h2>
            <p>
                To set up network user reports, first invite the bot using{" "}
                <a
                    href={`https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=1512097303623&scope=applications.commands%20bot`}
                    className="link"
                    target="_blank"
                >
                    this link
                </a>
                .
            </p>
            <p>
                Now, use <code>/reports set-channel</code> to set the channel in which your server will receive reports. You can also use this command to stop
                receiving reports.
            </p>
            <p>
                Use <code>/reports set-logs</code> to set the logging channel, which will contain records of automated actions. Removing the logging channel
                will make logs always appear in the primary reports channel.
            </p>
            <p>
                Use <code>/reports autoban</code> to enable/disable automatic banning for banshares, <code>/reports autokick</code> to enable/disable automatic
                kicking for hacked account reports, and <code>/reports autoban-threshold</code> to control a member age threshold to exempt long-time members of
                the server from autobans.
            </p>
            <h2>Categories</h2>
            <p>
                See the{" "}
                <a href="/docs/network-user-reports" className="link" target="_blank">
                    network user reports documentation
                </a>{" "}
                for more information. You can control which categories of reports to receive using <code>/reports categories</code>.
            </p>
            <a href="/quickstart/global-chat">
                <Button className="flex items-center gap-2">
                    Global Chat <FaAngleRight />
                </Button>
            </a>
        </Prose>
    );
}
