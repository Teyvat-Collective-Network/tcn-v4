import { FaAnglesLeft } from "react-icons/fa6";
import { Button } from "../../../../components/ui/button";
import { Prose } from "../../../../components/ui/prose";
import UserMention from "../../../../components/ui/user-mention";

export default function DocsExitProcedures() {
    return (
        <Prose>
            <h1>Docs &mdash; Exit Procedures</h1>
            <a href="/docs">
                <Button className="flex items-center gap-2">
                    <FaAnglesLeft /> Return to Docs Home
                </Button>
            </a>
            <p>
                This is a list of things to do and keep in mind if you are leaving the TCN, whatever the reason may be. This is essentially the inverse of the
                quickstart guide. Don&apos;t hesitate to reach out to an observer if you need any assistance, even once you&apos;ve been removed from HQ.
            </p>
            <h2>Motivation</h2>
            <p>
                It is good for all parties involved to ensure no confusion about the relationships between the parties. Therefore, once you are no longer a
                member of the TCN, it is beneficial for both the network and your server that people do not think you are still affiliated.
            </p>
            <p>
                We will make an announcement in the TCN Hub that you are no longer in the TCN (a reason will usually not be given unless you wish for us to
                provide one) and you may choose to do so as well in your server. Most crucially, you should remove identifying features such as the partner
                list.
            </p>
            <h2>Teardown</h2>
            <ul>
                <li>
                    Delete the TCN partner list (if you are using autosync, use <code>/autosync disable</code>), and if it is in its own TCN partner channel,
                    delete or archive the channel.
                </li>
                <li>
                    Unfollow <b>#network-events</b>. Note that if you hold an event in collaboration with a TCN server, you are still allowed to have your event
                    promoted through this channel.
                </li>
                <li>
                    Use <code>/disconnect</code> in your global channels.You do not need to delete them, but you should archive them for clarity if not. You can
                    then kick <UserMention id={process.env.GLOBAL_CLIENT_ID!} /> as it will no longer serve any purpose.
                </li>
                <li>
                    Kick <UserMention id={process.env.CLIENT_ID!} />. Staff autosync will stop working once your server is formally removed and your
                    server&apos;s dedicated role will be removed. Banshares will no longer be forwarded.
                </li>
            </ul>
            <p>
                You do not need to remove the other bots mentioned in the quickstart as they are not TCN-exclusive. The TCN-exclusive bots will stop working
                once your server is no longer in the TCN, so there is no point in keeping them around.
            </p>
            <p>
                Note that your free access to Daedalus&apos; custom client feature will be terminated if you are using it.{" "}
                <UserMention id="251082987360223233" /> (the maintainer of the bot) will reach out to you regarding this if it applies and assist you.
            </p>
            <p>
                If you are using global chat in a collaboration with another TCN server, you may keep it, as we allow global chat to be used by TCN servers with
                non-TCN servers connected. Your connection to the general channels will stop working.
            </p>
        </Prose>
    );
}
