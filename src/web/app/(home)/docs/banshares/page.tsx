import { FaAngleDown, FaAngleUp, FaAnglesLeft, FaMessage, FaMinus } from "react-icons/fa6";
import { Section } from "../../../../components/section";
import { Button } from "../../../../components/ui/button";
import { Panel } from "../../../../components/ui/panel";
import { Prose } from "../../../../components/ui/prose";

export default function DocsBanshares() {
    return (
        <Prose>
            <h1>Docs &mdash; Banshares</h1>
            <a href="/docs">
                <Button className="flex items-center gap-2">
                    <FaAnglesLeft></FaAnglesLeft> Return to Docs Home
                </Button>
            </a>
            <Section tag="h2" id="submitting">
                Submitting a banshare
            </Section>
            <p>
                To post a banshare, use the{" "}
                <a href="/banshare" className="link" target="_blank">
                    banshare form
                </a>
                .
            </p>
            <ul>
                <li>
                    <b>IDs:</b> This field is for the IDs of the offending users. Post a space-separated list of IDs. If the list is very long, it will be
                    automatically uploaded as a document by the bot. Do not paste a link; it will not be allowed. You are recommended to click <b>Check IDs</b>{" "}
                    to fetch all of the users&apos; tags to make sure you are bansharing the correct user(s).
                </li>
                <li>
                    <b>Reason:</b> Summarize why the users should be banned. This is used as the audit log reason for automated bans, so please write a detailed
                    reason and leave notes in the evidence.
                </li>
                <li>
                    <b>Evidence/Notes:</b> Include enough evidence to prove that your reasons are valid and for other mods to make an informed decision on what
                    to do.
                </li>
                <li>
                    <b>Server:</b> Choose the server from which you are submitting this banshare. If the incident is not bound to a particular server or is not
                    from one you staff, you should pick your &quot;main&quot; server or the one in which you feel you have the most prominent position. If you
                    do not see a particular server here, reach out to the server owner and direct them to{" "}
                    <a href="/quickstart/staff-link" className="link" target="_blank">
                        this page
                    </a>
                    .
                </li>
                <li>
                    <b>Severity:</b> See{" "}
                    <a href="#severity" className="link">
                        below
                    </a>
                    .
                </li>
                <li>
                    <b>Urgency:</b> If you mark your banshare as urgent, it will ping all observers (instead of just a few of them) to review it immediately and
                    send reminders more frequently if it is not addressed.
                </li>
            </ul>
            <p>If your ID list is longer than 20 users, the bot will not validate the users to avoid taking too long to get your banshare up for review.</p>
            <Section tag="h2" id="severity">
                Severity
            </Section>
            <p>
                Banshares are categorized into three severity levels and a special category. These are not strictly defined, and observers can adjust the
                severity before publishing. These are primarily used for autoban thresholds, should be primarily based on threat level, and do not indicate how
                &quot;bad&quot; we believe a user is. Here are our guidelines:
            </p>
            <Panel>
                <h3 className="flex items-center gap-2 mt-4">
                    <FaAngleUp color="red"></FaAngleUp> P0 (Critical)
                </h3>
                <p>The offense is either extremely severe or all servers should immediately ban them and/or have no reason not to ban them.</p>
                <ul>
                    <li>
                        Spamming NSFW/NSFL constitutes a <b>P0</b> as this violates all servers&apos; rules and Discord&apos;s Terms of Service and is an
                        immediate threat to member safety.
                    </li>
                    <li>
                        Hacked/raid accounts posting spam/scam links within the server should be <b>P0</b> even though the offense is not particularly severe as
                        they are a high threat to other servers.
                    </li>
                </ul>
                <hr className="my-8" />
                <h3 className="flex items-center gap-2">
                    <FaMinus color="yellow"></FaMinus> P1 (Medium)
                </h3>
                <p>
                    The offense is somewhat severe and almost all servers will want to immediately ban them, but individual servers may have other
                    considerations and choose not to ban them.
                </p>
                <ul>
                    <li>
                        This severity usually involves repeated minor offenses for which servers may have different viewpoints on whether they deserve
                        additional chances.
                    </li>
                </ul>
                <hr className="my-8" />
                <h3 className="flex items-center gap-2">
                    <FaAngleDown color="blue"></FaAngleDown> P2 (Low)
                </h3>
                <p>The offense is more nuanced and some servers may choose not to ban them. Note that very minor offenses should not even be banshared.</p>
                <ul>
                    <li>
                        This severity usually involves nuanced cases where the user has not become a severe threat to safety but is more so a nuisance or
                        troublemaker and some servers may not care to ban them.
                    </li>
                </ul>
                <hr className="my-8" />
                <h3 className="flex items-center gap-2">
                    <FaMessage color="grey"></FaMessage> DM Scam
                </h3>
                <p>
                    The offense is a DM scam (art scam, steam scam, etc.). These are categorized separately as some servers do not wish to receive these
                    banshares.
                </p>
            </Panel>
            <Section tag="h2" id="policy">
                Policy
            </Section>
            <h3>Purpose</h3>
            <p>
                The purpose of the banshare system is as a pre-emptive safety measure. Banshares should be used to eliminate threats from the network and ensure
                server safety, not as a punishment.
            </p>
            <h3>Banshare Requirements</h3>
            <p>The following are required of banshares at a minimum, but meeting these requirements does not necessarily ensure a banshare is good enough:</p>
            <ul>
                <li>
                    <b>Demonstrable Threat:</b> The offense must be severe enough that the user should be considered a threat to any other servers they join,
                    and there must be sufficient reason to believe that the user may join TCN servers.
                    <ul>
                        <li>Spamming NSFW in a TCN server satisfies both conditions.</li>
                        <li>
                            Being banned for minor reasons in one server does not satisfy the first condition unless their behavior repeats again elsewhere.
                        </li>
                        <li>
                            Spamming NSFW in a random server not associated with the TCN or the Genshin Impact community does not necessarily satisfy the second
                            condition as there is no demonstrable threat to the network unless the user is already in any TCN or Genshin Impact servers.
                        </li>
                    </ul>
                </li>
                <li>
                    <b>Descriptive Reason:</b> The reason must clearly explain what the offense was. A moderator should be able to understand why they were
                    banned by just looking at the ban reason on its own.
                    <ul>
                        <li>&quot;Spamming NSFW images in XYZ Mains&quot; is a good reason.</li>
                        <li>&quot;Typical steam scammer&quot; is an acceptable reason.</li>
                        <li>&quot;Troll&quot; is not a good reason.</li>
                    </ul>
                </li>
                <li>
                    <b>Sufficient Evidence:</b> The provided evidence must prove that the offense happened as described in the ban reason and all listed users
                    were involved. Exceptions are granted in the case of large raids as it is both impractical to attach evidence for every single user and for
                    the team to review that much evidence. In those cases, trust is placed on the author to ensure that the list of users is correct.
                </li>
            </ul>
            <Section tag="h2" id="lifecycle">
                Lifecycle of a Banshare
            </Section>
            <ol>
                <li>
                    A banshare is submitted to the form and posted to <b>#banshare-logs</b> in HQ.
                </li>
                <li>
                    Any council member may lock the banshare, preventing it from being published or rejected. This is to allow time to type up a message
                    regarding the banshare.
                </li>
                <li>Once concerns have been addressed (or if there are none), an observer will choose to either publish or reject the banshare.</li>
                <li>If a banshare is published, it will be sent to all subscribed servers (including the TCN Hub).</li>
                <li>
                    An observer can rescind a banshare after it has been published in case of issues or overturning the banshare, in which case a rescind notice
                    will be sent to all servers (but users will not be automatically unbanned in any situation). If this occurs quickly enough, ongoing autobans
                    will be canceled.
                </li>
            </ol>
        </Prose>
    );
}
