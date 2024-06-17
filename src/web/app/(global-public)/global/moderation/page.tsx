import { FaComments } from "react-icons/fa6";
import { Section } from "../../../../components/section";
import Mention from "../../../../components/ui/mention";
import { Prose } from "../../../../components/ui/prose";

export default function GlobalModeration() {
    return (
        <Prose>
            <h1>Global Moderation Philosophy &amp; Policies</h1>
            <p>
                This document outlines how to moderate the global chat, both in terms of technical features and policies. This document is subject to change at
                any time and should not be considered as official or policy. The two documents linked below are official policy.
            </p>
            <ul>
                <li>
                    <a href="/docs/global-chat-rules" className="link" target="_blank">
                        Global Chat Rules
                    </a>
                </li>
                <li>
                    <a href="/global/moderator-agreement" className="link" target="_blank">
                        Global Chat Moderator Agreement
                    </a>
                </li>
            </ul>
            <Section tag="h2" id="how-it-works">
                How does Global Chat work?
            </Section>
            <ul>
                <li>
                    When a message is sent in a global channel, the bot first checks if it is allowed to be sent.
                    <ul>
                        <li>
                            If the user is banned or the message contains any filtered content, it is deleted immediately and logged, and nothing more happens.
                        </li>
                    </ul>
                </li>
                <li>If it is allowed to be sent, it will be copied by the bot via a webhook message to all other connected channels.</li>
                <li>If a message&apos;s source is edited, it will be edited everywhere.</li>
                <li>If a message or any of its copies are deleted anywhere, it will be deleted everywhere, including from the origin server.</li>
            </ul>
            <Section tag="h2" id="features">
                What features/commands are available?
            </Section>
            <ul>
                <li>Right click / long hold a message and select Apps &gt; Get Author or use /global author to identify the user that sent a message.</li>
                <li>
                    Right click / long hold a message and select Apps &gt; Purge or use /global purge message to force-delete a message and all of its copies,
                    even if an attempt to delete it already occurred.
                </li>
                <li>
                    Use /global ban to ban a user from a global channel, preventing them from sending messages to it from any server. You (and individual
                    servers&apos; moderators) can also ban them locally, which prevents them from sending messages there and blocks their messages from being
                    relayed to it.
                </li>
                <li>Use /global help to show a help modal about how global chat works in case people are confused or asking why everyone is a bot.</li>
                <li>Delete a message anywhere to delete it everywhere.</li>
            </ul>
            <Section tag="h2" id="philosophy">
                Moderation Philosophy
            </Section>
            <p>
                When guidance can be given, it should be preferred over warnings and penalties. When a user should know better and/or has demonstrated that they
                are not changing or improving, they should be warned. When a user has been warned enough times that they should know they are not allowed to do
                what they are doing and/or has demonstrated that they will not change or improve, they should be banned.
            </p>
            <Section tag="h2" id="policy">
                Policy
            </Section>
            <ul>
                <li>
                    For minor offenses (generally, when you believe a user should not be penalized because it was not severe enough) or if it was a conversation
                    that went a bit too far on behalf of many users, verbal warnings can be delivered in the chat itself, serving also to remind everyone else
                    of the rules. However, be careful not to allow the chat to devolve into a witch-hunt or berate the user.
                </li>
                <li>
                    For more significant warnings, use <code>/global warn</code> instead (it may still be a good idea to leave a reminder in chat about the
                    specific rule and to follow the rules).
                </li>
                <li>
                    Once a user has demonstrated inability to change and comply with rules and regulations (within your reasonable judgement), ban them and set
                    a reason in the command to notify them.
                </li>
                <li>If a user has caused significant or grievous harm, feel free to escalate to observers to discuss a banshare.</li>
            </ul>
            <Section tag="h2" id="watchlist">
                Watchlist
            </Section>
            <ul>
                <li>
                    You can keep track of users in a watchlist entry in{" "}
                    <Mention>
                        <FaComments /> global-watchlist
                    </Mention>
                    . Warns and bans will be logged, but you may wish to use this for more minor offenses or just to keep notes.
                </li>
                <li>Refer to the watchlist when dealing with an offense to see what level of sanction should be applied.</li>
            </ul>
            <Section tag="h2" id="appeals">
                Appeals
            </Section>
            <ul>
                <li>
                    Appeals can be submitted to TCN Hub modmail. The modmail is only visible to hub moderators by default, but global mods will be added to the
                    thread if it pertains to global chat.
                </li>
                <li>
                    Warnings can be revoked under the following (non-exhaustive) circumstances:
                    <ul>
                        <li>The initial warning was not valid (the user did not do anything, the offense was not a rule violation, etc.).</li>
                        <li>The offense can be justified or excused under some circumstance (this will rarely happen).</li>
                    </ul>
                </li>
                <li>
                    Bans can be overturned under the following (non-exhaustive) circumstances:
                    <ul>
                        <li>Any of the reasons for revoking warnings.</li>
                        <li>The user was not sufficiently warned before being banned (for offenses that do not warrant immediate ban-on-sight).</li>
                        <li>
                            The user can demonstrate that they understand their reason for being banned and acknowledge those problems and show that they are
                            apologetic and have a desire to change.
                        </li>
                        <li>The user has demonstrated that they have changed elsewhere, tangibly (e.g. in another TCN server outside of global chat).</li>
                    </ul>
                </li>
            </ul>
            <Section tag="h2" id="inquiries">
                Responding to Inquiries
            </Section>
            <ul>
                <li>
                    You may answer members&apos; questions about rules and policies, but feel free to ask for another mod or an observer (you are not required
                    or expected to publicly explain rules).
                </li>
                <li>
                    If members inquire about other member&apos;s punishments, tell them to ask the member themselves. Do not share member cases, and we will not
                    answer those inquiries through private modmail either.
                </li>
                <li>
                    If members ask for other users to be unbanned, tell them the member may appeal through modmail but asking for unbans through another member
                    is not allowed.
                </li>
                <li>
                    If members ask for direct mod actions (e.g. &quot;ban this user&quot;), act as you deem appropriate but if the action would not be
                    appropriate, inform the member they can call for mod attention if they believe there is a problem but to not ask for direct actions
                    (backseat moderating).
                </li>
            </ul>
        </Prose>
    );
}
