import { FaAngleLeft, FaAngleRight, FaAnglesLeft } from "react-icons/fa6";
import { Button } from "../../../../components/ui/button";
import { Prose } from "../../../../components/ui/prose";

export default function QuickstartGlobalChat() {
    return (
        <Prose>
            <h1>Quickstart &mdash; Global Chat</h1>
            <div className="flex items-center gap-4">
                <a href="/quickstart">
                    <Button className="flex items-center gap-2">
                        <FaAnglesLeft></FaAnglesLeft> Return to Quickstart Home
                    </Button>
                </a>
                <a href="/quickstart/banshares">
                    <Button className="flex items-center gap-2">
                        <FaAngleLeft></FaAngleLeft> Banshares
                    </Button>
                </a>
            </div>
            <p>
                Global chat is a feature available to all TCN servers that allows members to chat with members from other servers. There is a global channel
                available to connect for all of your members and two channels for staff. All of these are optional, and you may use all, some, or none of them.
            </p>
            <h2>Setup</h2>
            <p>
                First, invite the bot using{" "}
                <a
                    href={`https://discord.com/api/oauth2/authorize?client_id=${process.env.GLOBAL_CLIENT_ID}&permissions=137976212480&scope=bot%20applications.commands`}
                    className="link"
                    target="_blank"
                >
                    this link
                </a>
                .
            </p>
            <h3>Permissions</h3>
            <p>
                Ensure that the bot has all of the following permissions in all channels you want to connect. You can uncheck these from the server-wide
                permissions if you would like.
            </p>
            <ul>
                <li>
                    <b>View Channel:</b> this is required for all functionality
                </li>
                <li>
                    <b>Read Message History:</b> this is required to be able to delete older messages
                </li>
                <li>
                    <b>Manage Webhooks:</b> this is required to create webhooks or fetch your custom webhook to post incoming messages
                </li>
                <li>
                    <b>Manage Messages:</b> this is required to delete messages that were deleted elsewhere
                </li>
            </ul>
            <p>
                Because of the possibility of spam or abusive content that will need to be deleted later on, if you do not allow the bot to delete messages or
                view message history, it will also stop sending them to your channel.
            </p>
            <p>
                <b>Note:</b> Because bot-owned webhooks cannot send emoji that the bot cannot send, emoji from non-TCN servers won&apos;t work by default. To
                fix this, create a webhook manually in the channel. You do not need to do anything else.
            </p>
            <h3>Connecting</h3>
            <p>
                Your global channels will not be able to be used for anything else. All messages sent to the channel are relayed, so you must use channels
                dedicated to this purpose.
            </p>
            <p>
                Once your channel permissions are set up, use <code>/global connect</code> and select the appropriate global channel.
            </p>
            <p>
                To test your connection, you may use <b>#tcn-staff-lounge</b> and <b>#tcn-staff-office</b> in the{" "}
                <a href={process.env.HUB_INVITE} className="link" target="_blank">
                    TCN Hub
                </a>{" "}
                if you do not have access to another server&apos;s staff global channels.
            </p>
            <h3>Managing your connection</h3>
            <ul>
                <li>
                    Use <code>/global connection suspend</code> to temporarily pause the connection in both directions and{" "}
                    <code>/global connection resume</code> to revert this.
                </li>
                <li>
                    Use <code>/global connection move</code> to send your connection to another channel without resetting your settings.
                </li>
                <li>
                    Use <code>/global connection edit</code> to edit your connection&apos;s settings.
                </li>
                <li>
                    Use <code>/global disconnect</code> to delete your connection entirely. You will lose your settings.
                </li>
            </ul>
            <h2>Usage</h2>
            <p>
                For usage information, visit the{" "}
                <a href="/docs/global-chat" className="link">
                    documentation page
                </a>
                .
            </p>
            <a href="/quickstart/staff-link">
                <Button className="flex items-center gap-2">
                    Staff Link <FaAngleRight></FaAngleRight>
                </Button>
            </a>
        </Prose>
    );
}
