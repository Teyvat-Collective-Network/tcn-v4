import { FaAnglesLeft, FaHashtag } from "react-icons/fa6";
import { Section } from "../../../../components/section";
import { Button } from "../../../../components/ui/button";
import Mention from "../../../../components/ui/mention";
import { Panel } from "../../../../components/ui/panel";
import { Prose } from "../../../../components/ui/prose";

export default function DocsNetworkUserReports() {
    return (
        <Prose>
            <h1>Docs &mdash; Network User Reports</h1>
            <a href="/docs">
                <Button className="flex items-center gap-2">
                    <FaAnglesLeft /> Return to Docs Home
                </Button>
            </a>
            <Section tag="h2" id="submitting">
                Submitting a report
            </Section>
            <p>
                To post a report, use the{" "}
                <a href="/report" className="link" target="_blank">
                    network user report form
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
                    <b>Reason:</b> Summarize the issue with the user. This is used as the audit log reason for automated bans and kicks, so please write a
                    detailed reason and leave notes in the evidence.
                </li>
                <li>
                    <b>Evidence/Notes:</b> Include enough evidence to prove that your reasons are valid and for other mods to make an informed decision on what
                    to do.
                </li>
                <li>
                    <b>Server:</b> Choose the server from which you are submitting this report. If the incident is not bound to a particular server or is not
                    from one you staff, you should pick your &quot;main&quot; server or the one in which you feel you have the most prominent position. If you
                    do not see a particular server here, reach out to the server owner and direct them to{" "}
                    <a href="/quickstart/staff-link" className="link" target="_blank">
                        this page
                    </a>
                    .
                </li>
                <li>
                    <b>Category:</b> See{" "}
                    <a href="#categories" className="link">
                        below
                    </a>
                    .
                </li>
                <li>
                    <b>Urgency:</b> If you mark your report as urgent, it will ping all observers (instead of just a few of them) to review it immediately and
                    send reminders more frequently if it is not addressed.
                </li>
            </ul>
            <p>If your ID list is longer than 20 users, the bot will not validate the users to avoid taking too long to get your report up for review.</p>
            <Section tag="h2" id="categories">
                Categories
            </Section>
            <p>Reports are categorized into three strictly defined groups based on the type of offense.</p>
            <Panel>
                <h3 className="mt-4">Banshares</h3>
                <p>
                    Banshares are for very severe offenses, where it is a matter of member/community safety that the user should be banned across the network.
                    These cases should have sufficient weight to justify banning them immediately, as opposed to allowing mods to keep watch and deal with them
                    reactively.
                </p>
                <ul>
                    <li>
                        Spamming NSFW/NSFL justifies a banshare as this violates all servers&apos; rules and Discord&apos;s Terms of Service and is an immediate
                        threat to member safety. Letting the member join another server and repeat this behavior and be banned reactively would be
                        irresponsible.
                    </li>
                    <li>Troll accounts that have little to no positive contribution or repeatedly cause trouble across many servers should be banshared.</li>
                    <li>
                        If you doubt if a case should be a banshare or not, it should probably be an <b>advisory report</b> instead.
                    </li>
                </ul>
                <hr className="my-8" />
                <h3>Advisory Reports</h3>
                <p>
                    Advisory reports are for minor offenses where you wish to share information about a user with other staff in the network but do not believe
                    that they need to be banned immediately for safety.
                </p>
                <ul>
                    <li>
                        Being rude to and disobeying staff to the point of being banned should be an advisory report if they have not been overly abusive and
                        have not repeated this behavior across servers.
                    </li>
                    <li>If you are unsure if a case is severe enough for a banshare, an advisory report is probably suitable.</li>
                </ul>
                <hr className="my-8" />
                <h3>Hacked Account Reports</h3>
                <p>
                    Hacked account reports are for cases where it&apos;s reasonably obviouus that an account is compromised or in some way controlled by a bot.
                    Generally, compromised accounts will not attempt to return to servers from which they are removed, so automatically kicking them from any
                    servers they are still in is usually sufficient.
                </p>
                <p>
                    Even though they have a small chance to join other servers (usually, scammers just use new accounuts), the benefit to permanently banning
                    all of these accounts is minimal and the experience for a user whose account gets hacked and returns to being banned from all of their
                    servers outweighs the benefits.
                </p>
            </Panel>
            <Section tag="h2" id="policy">
                Policy
            </Section>
            <h3>Purpose</h3>
            <p>
                The purpose of the report system is as a pre-emptive safety measure. Reports should be used to eliminate threats from the network and ensure
                server safety, not as a heavier form of punishment than a simple ban.
            </p>
            <h3>Report Requirements</h3>
            <p>The following are required of reports at a minimum, but meeting these requirements does not necessarily ensure a report is good enough:</p>
            <ul>
                <li>
                    <b>Demonstrable Threat:</b> The offense must be relevant to TCN servers. For banshares, the offense needs to be severe enough to justify
                    pre-emptively banning them and not giving any second chances.
                    <ul>
                        <li>Spamming NSFW in a TCN server satisfies this condition.</li>
                        <li>
                            Being banned for minor reasons in one server does not satisfy the condition for banshares unless their behavior repeats again
                            elsewhere. For a first offense, an advisory report is suitable.
                        </li>
                        <li>
                            Being abusive in a random server not associated with the TCN or the Genshin Impact community does not necessarily satisfy the
                            relevance condition as there is no demonstrable threat to the network unless the user is already in any TCN or Genshin Impact
                            servers.
                        </li>
                    </ul>
                </li>
                <li>
                    <b>Descriptive Reason:</b> The reason must clearly explain what the offense was. If the user is banned, a moderator looking through the
                    audit logs should be able to get a rough idea of why this user was banned just from the audit log reason.
                    <ul>
                        <li>&quot;Spamming NSFW images in XYZ Mains&quot; is a good reason.</li>
                        <li>&quot;Typical steam scammer&quot; is an acceptable reason.</li>
                        <li>&quot;Troll&quot; is not a good reason.</li>
                    </ul>
                </li>
                <li>
                    <b>Sufficient Evidence:</b> The provided evidence must prove that the offense happened as described in the reason and all listed users were
                    involved. Exceptions are granted in the case of large raids as it is both impractical to attach evidence for every single user and for the
                    team to review that much evidence. In those cases, trust is placed on the author to ensure that the list of users is correct.
                </li>
            </ul>
            <Section tag="h2" id="lifecycle">
                Lifecycle of a Network User Report
            </Section>
            <ol>
                <li>
                    A report is submitted to the form and posted to{" "}
                    <Mention>
                        <FaHashtag /> network-user-reports
                    </Mention>{" "}
                    in HQ.
                </li>
                <li>
                    Any council member may lock the report, preventing it from being published or rejected. This is to allow time to type up a message regarding
                    the report.
                </li>
                <li>Once concerns have been addressed (or if there are none), an observer will choose to either publish or reject the report.</li>
                <li>If a report is published, it will be sent to all subscribed servers (including the TCN Hub).</li>
                <li>
                    An observer can rescind a report after it has been published in case of issues or overturning the report, in which case a rescind notice
                    will be sent to all servers (but users will not be automatically unbanned in any situation). If this occurs quickly enough, ongoing
                    automated actions will be canceled.
                </li>
            </ol>
        </Prose>
    );
}
