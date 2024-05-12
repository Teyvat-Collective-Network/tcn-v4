import { FaAngleLeft, FaAngleRight, FaAnglesLeft } from "react-icons/fa6";
import { Button } from "../../../../components/ui/button";
import { Prose } from "../../../../components/ui/prose";

export default function QuickstartBanshares() {
    return (
        <Prose>
            <h1>Quickstart &mdash; Banshares</h1>
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
                Banshares are our way of sharing information on problematic users so you can eliminate potential threats or disturbances before they appear in
                your server. You are not required to ban users who have been banshared &mdash; the purpose is simply to provide you with information for you to
                use as you see fit.
            </p>
            <p>
                To submit a banshare, visit the{" "}
                <a href="/banshare" className="link">
                    banshare form
                </a>
                .
            </p>
            <h2>Setup</h2>
            <p>
                To set up the banshare, first invite the bot using{" "}
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
                Now, use <code>/banshares subscribe</code> to set the channel in which your server will receive banshares. <code>/banshares unsubscribe</code>{" "}
                will remove this.
            </p>
            <p>
                Use <code>/banshares log enable</code> to add a logging channel for actions taken by the &quot;Execute Banshare&quot; button or autoban. Use{" "}
                <code>/banshares log disable</code> to remove a logging channel.
            </p>
            <p>
                Use <code>/banshares autoban</code> to modify your server&apos;s autoban settings and <code>/banshares daedalus enable</code> or{" "}
                <code>/banshares daedalus disable</code> to disable the Daedalus integration (which automatically adds user history for banshared users when
                they are banned).
            </p>
            <h2>Severity</h2>
            <p>
                The <b>severity</b> of a banshare is an attribute set to give you more control over banshare actions. The four severities are DM, P0, P1, and
                P2, where P0 is the highest and P2 is the lowest. DM is a special classification used for DM scams. You can choose to not receive these
                banshares at all in the settings.
            </p>
            <p>The approximate definitions for these severities are:</p>
            <ul>
                <li>
                    <b>P0:</b> The offense is either extremely severe or all servers should immediately ban them and/or have no reason not to ban them (e.g.
                    raids, hacked accounts, etc.).
                </li>
                <li>
                    <b>P1:</b> The offense is somewhat severe and almost all servers will want to immediately ban them, but individual servers may have other
                    considerations and choose not to ban them (e.g. repeated minor trolling, etc.).
                </li>
                <li>
                    <b>P2:</b> The offense is more nuanced and some servers may choose not to ban them. Note that very minor offenses should not even be
                    banshared.
                </li>
            </ul>
            <p>
                Feel free to set up the autoban thresholds however you see fit. You can set different rules based on membership; e.g. you can autoban all
                banshares against people not in your server but choose to manually review P1 and P2 banshares against server members.
            </p>
            <a href="/quickstart/global-chat">
                <Button className="flex items-center gap-2">
                    Global Chat <FaAngleRight />
                </Button>
            </a>
        </Prose>
    );
}
