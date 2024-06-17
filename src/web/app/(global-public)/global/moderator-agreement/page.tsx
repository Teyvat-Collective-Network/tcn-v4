import { Prose } from "../../../../components/ui/prose";

export default function GlobalModeratorAgreement() {
    return (
        <Prose>
            <h1>Global Chat Mod Agreement</h1>
            <p>
                In order to be a global chat moderator, you must review and accept this agreement. The purpose of this agreement is both so you acknowledge
                certain policies in place and promise to follow them and to detail our responsibilities to you and what we offer you.
            </p>
            <h2>Terms of the Agreement</h2>
            <p>
                <b>You acknowledge and agree</b> that, as a volunteer global chat moderator:
            </p>
            <ol>
                <li>
                    You will abide by the{" "}
                    <a href="/docs/global-chat-rules" className="link" target="_blank">
                        Global Chat Rules
                    </a>{" "}
                    and enforce it to the best of your ability.
                </li>
                <li>
                    You will abide by all Discord Terms of Service and Community Guidelines and maintain the global chat environment in accordance with its
                    rules and guidelines to the best of your ability.
                </li>
                <li>
                    You will not abuse your moderator position in any way, including, but not limited to:
                    <ol>
                        <li>Using moderator privileges in personal disputes not in line with the rules.</li>
                        <li>Threatening moderator action for personal benefit not in line with the rules.</li>
                        <li>
                            Revealing private discussions or otherwise publicizing / &quot;leaking&quot; private information e.g. user punishments.
                            <ul>
                                <li>
                                    In situations like with spam bots, informing chat that you banned them or answering someone asking &quot;what happened&quot;
                                    is not considered revealing private information, as anyone else watching chat would have been able to see the messages.
                                </li>
                                <li>
                                    Essentially, do not reveal anything that is between the mod team and the user (such as discussions on behavior) or within
                                    the mod team only (such as who is being watched by the mods).
                                </li>
                            </ul>
                        </li>
                        <li>Any other form of abuse of authority or permissions.</li>
                    </ol>
                </li>
                <li>Your actions reflect on the TCN and therefore violations of the rules may be treated more harshly.</li>
                <li>
                    You do not represent the TCN nor speak on its behalf and are solely responsible for your statements and actions, which do not represent the
                    views, opinions, or actions of the TCN.
                </li>
            </ol>
            <p>
                <b>The TCN agrees</b> to:
            </p>
            <ol>
                <li>Reasonably protect and defend your actions and authority and support you as needed for you to effectively moderate.</li>
                <li>Maintain transparent discussion regarding policy changes.</li>
                <li>Allow you to resign at any time without requiring a reason and without any penalty.</li>
                <li>
                    Respect your right to question and challenge policies and the TCN without punishment so long as it is reasonably civil and in good faith.
                </li>
                <li>Inform you in advance of planned changes to the rules or moderator agreement and give reasonable time for feedback.</li>
            </ol>
            <p>Should this document be changed, you will be asked to agree to the changes within a reasonable rollover period.</p>
        </Prose>
    );
}
