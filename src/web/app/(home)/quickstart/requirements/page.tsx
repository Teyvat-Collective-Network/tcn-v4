import { FaAngleRight, FaAnglesLeft } from "react-icons/fa6";
import { Button } from "../../../../components/ui/button";
import { Prose } from "../../../../components/ui/prose";

export default function QuickstartRequirements() {
    return (
        <Prose>
            <h1>Quickstart &mdash; Requirements</h1>
            <a href="/quickstart">
                <Button className="flex items-center gap-2">
                    <FaAnglesLeft></FaAnglesLeft> Return to Quickstart Home
                </Button>
            </a>
            <h2>Partner List</h2>
            <p>
                You must display the list of TCN servers and other TCN partners in a publicly visible channel, clearly separated from your server&apos;s
                individual partners. You can find an up-to-date version in <b>#partner-list</b> in the TCN Hub, though you do not have to follow this format.
            </p>
            <h3 id="autosync">Autosync</h3>
            <p>
                Want to skip the hassle of updating it every time something changes? Use autosync to keep your list updated with just a one-time setup and zero
                maintenance afterwards! Alternatively, you may just use <code>/partner-list view public:true</code> to satisfy the requirements.
            </p>
            <p>To set up autosync:</p>
            <ul>
                <li>
                    Invite the TCN bot:{" "}
                    <a
                        href={`https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=1512097303623&scope=applications.commands%20bot`}
                        className="link"
                        target="_blank"
                    >
                        [invite]
                    </a>
                </li>
                <li>
                    To have the bot post the messages, use <code>/autosync channel set</code>. To have a webhook post the messages, use{" "}
                    <code>/autosync webhook set</code>.
                </li>
                <li>
                    If you would like the bot to repost the embed instead of editing it each time (or vice versa), run <code>/autosync mode set</code>.
                </li>
            </ul>
            <h3>Requirements</h3>
            <p>The following are required:</p>
            <ul>
                <li>
                    <b>Website URL:</b> {process.env.DOMAIN}
                </li>
                <li>
                    <b>Description:</b> A description of the network
                </li>
                <li>
                    <b>Partner List:</b> The list of all TCN partners (must not contain any other servers)
                </li>
                <li>
                    <b>TCN Hub:</b> The description for the TCN Hub and its invite link (<code>{process.env.HUB_INVITE}</code>)
                </li>
                <li>
                    <b>Genshin Wizard:</b> The description for Genshin Wizard and its website link (<code>https://genshinwizard.com</code>)
                </li>
                <li>
                    <b>Genshin Impact Tavern:</b> The description for Genshin Impact Tavern and its invite (<code>https://discord.gg/genshinimpacttavern</code>)
                </li>
                <li>
                    <b>Daedalus:</b> The description for Daedalus and its dashboard link (<code>https://daedalusbot.xyz</code>)
                </li>
            </ul>
            <h2>Partner Event Channel</h2>
            <p>
                You must follow <code>#network-events</code> in a publicly visible channel in your server. You can make this the same channel as where you post
                other partner events.
            </p>
            <a href="/quickstart/banshares">
                <Button className="flex items-center gap-2">
                    Banshares <FaAngleRight></FaAngleRight>
                </Button>
            </a>
        </Prose>
    );
}
