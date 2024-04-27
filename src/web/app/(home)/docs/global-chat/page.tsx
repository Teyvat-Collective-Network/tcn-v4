import { FaAnglesLeft } from "react-icons/fa6";
import { Section } from "../../../../components/section";
import { Button } from "../../../../components/ui/button";
import { Prose } from "../../../../components/ui/prose";

export default function DocsGlobalChatt() {
    return (
        <Prose>
            <h1>Docs &mdash; Global Chat</h1>
            <a href="/docs">
                <Button className="flex items-center gap-2">
                    <FaAnglesLeft></FaAnglesLeft> Return to Docs Home
                </Button>
            </a>
            <Section tag="h2" id="channels">
                Channels
            </Section>
            <p>There are three main channels in the global chat:</p>
            <ul>
                <li>
                    <b>TCN Public General:</b> This is the public &quot;general&quot; channel which all server members may access.
                </li>
                <li>
                    <b>TCN Staff Lounge:</b> This is the staff general chat which can be made accessible to anyone you would trust with access to your
                    server&quot;s general staff chat.
                </li>
                <li>
                    <b>TCN Staff Office:</b> This is the staff business channel which may only be made accessible to current staff of your server.
                </li>
            </ul>
            <Section tag="h2" id="moderation">
                Moderation
            </Section>
            <h3>Deleting Messages</h3>
            <p>
                When a message or any copy of it is deleted, all copies of it and the original will be deleted. If this isn&quot;t working, make sure the bot
                has the required permissions in your channel.
            </p>
            <p>
                You can use <code>/global purge last</code> to purge a slice of recent messages, <code>/global purge between</code> to purge all messages
                between two selected messages, or <code>/global purge since</code> to purge messages within a certain time frame. In all cases, you can specify
                a user to filter by.
            </p>
            <p>
                If deletion didn&apos;t work, you can use <code>/global purge message</code> to instruct the bot to retry purging the message.
            </p>
            <h3>Banning</h3>
            <p>
                Use <code>/global ban</code> to ban a user from the current global channel. This will notify the user (unless disabled) and will be logged. The
                bot will stop relaying their messages and instead delete them in any connected channel.
            </p>
            <p>Note that this ban works per channel independently, so make sure you are in the right channel.</p>
            <p>
                Use <code>/global unban</code> to revoke a ban. This will not notify the user (unless enabled) and will be logged.
            </p>
            <h3>Panic Mode</h3>
            <p>
                This command alerts all observers and can only be disabled by an observer. Misuse of this command may result in the loss of global chat
                privileges or other consequences. If you think it might be needed, don&apos;t be afraid to use it — we will discuss with you if we believe it
                was unnecessary, just don&apos;t play with it or use it for testing purposes.
            </p>
            <p>
                If there is a raid or ongoing network-wide incident, you can use <code>/global panic</code> to completely shut down this global channel. It will
                stop relaying messages from all servers but will continue to relay deletions.
            </p>
            <Section tag="h2" id="management">
                Management
            </Section>
            <ul>
                <li>
                    <code>/global channels delete</code> deletes a global channel. Do not use this unless the council has agreed to terminate a global channel
                    or it was a temporary channel that is no longer needed.
                </li>
                <li>
                    <code>/global channels create</code> creates a new global channel.
                </li>
                <li>
                    <code>/global channels edit</code> edits an existing global channel.
                </li>
                <li>
                    <code>/global unpanic</code> ends an ongoing panic state.
                </li>
            </ul>
            <Section tag="h2" id="other-commands">
                Other Commands
            </Section>
            <ul>
                <li>
                    <code>/global help</code> displays the information embed and links the rules.
                </li>
                <li>
                    <code>/global nickname</code> changes your global nickname which supercedes your display name, which is what is normally shown.
                </li>
            </ul>
        </Prose>
    );
}
