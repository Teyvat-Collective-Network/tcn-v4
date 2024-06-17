import { FaAngleLeft, FaAnglesLeft } from "react-icons/fa6";
import { Button } from "../../../../../../components/ui/button";
import { Prose } from "../../../../../../components/ui/prose";

export default function OnboardingTechnicalElections() {
    return (
        <Prose>
            <h1>Onboarding &mdash; Technical &mdash; Elections</h1>
            <div className="flex items-center gap-4">
                <a href="/admin/onboarding/technical">
                    <Button className="flex items-center gap-2">
                        <FaAnglesLeft /> Return to Technical Guide Home
                    </Button>
                </a>
                <a href="/admin/onboarding/technical/votes">
                    <Button className="flex items-center gap-2">
                        <FaAngleLeft /> Votes
                    </Button>
                </a>
            </div>
            <p>
                To initiate an election, use <code>/election start</code> and specify the wave (should be one greater than the last wave), the number of seats,
                and a short and long reason. The short reason goes in the thread creation message and the long reason should be a full sentence and will be
                appended to the first paragraph of the notification follow-up. You will be able to preview the message before confirming.
            </p>
            <p>
                As candidates are nominated, use <code>/election set-as-nominated</code> to keep track. This is not <i>strictly</i> necessary, but when trying
                to start the voting phase, the bot will prevent the action if there are still open nominations, acting as a failsafe.
            </p>
            <p>
                When a candidate declines their nomination, use <code>/election set-as-declined</code>. When a candidate accepts their nomination, right click
                the message and select <code>Apps &gt; Mark As Statement</code> to update their status to accept and track their statement.
            </p>
            <p>
                Once the nomination phase is over (this will not happen automatically to allow time for exceptional circumstances), use{" "}
                <code>/election start-voting</code>. This will start the vote, pin all candidate statements, and send an embed linking all candidates&apos;
                statements.
            </p>
            <p>
                When the vote finishes, the vote message will update with the winners and any tied candidates displayed in totally randomized order. If there
                are any winners, there will be an option to automatically promote all winners (this does not happen automatically in case of exceptional
                circumstances).
            </p>
        </Prose>
    );
}
