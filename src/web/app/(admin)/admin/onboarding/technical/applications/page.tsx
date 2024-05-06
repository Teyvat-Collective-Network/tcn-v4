import { FaAngleLeft, FaAngleRight, FaAnglesLeft, FaComments } from "react-icons/fa6";
import { Button } from "../../../../../../components/ui/button";
import Mention from "../../../../../../components/ui/mention";
import { Prose } from "../../../../../../components/ui/prose";

export default function OnboardingTechnicalApplications() {
    return (
        <Prose>
            <h1>Onboarding &mdash; Technical &mdash; Applications</h1>
            <div className="flex items-center gap-4">
                <a href="/admin/onboarding/technical">
                    <Button className="flex items-center gap-2">
                        <FaAnglesLeft></FaAnglesLeft> Return to Technical Guide Home
                    </Button>
                </a>
                <a href="/admin/onboarding/technical/suggestions">
                    <Button className="flex items-center gap-2">
                        <FaAngleLeft></FaAngleLeft> Suggestions
                    </Button>
                </a>
            </div>
            <p>
                When a user submits an application to the{" "}
                <a href="/apply" className="link" target="_blank">
                    application form
                </a>
                , a thread is automatically opened under{" "}
                <Mention>
                    <FaComments></FaComments> applicants
                </Mention>{" "}
                with the status set to <b>pending</b>.
            </p>
            <p>
                Do not delete these channels manually! If an application was submitted by mistake (e.g. a duplicate or incomplete submission) or is abusive, use{" "}
                <code>/application nuke</code>, otherwise the bot will detect the deletion and repost the thread (and nukeguard will trigger and ban you).
            </p>
            <p>
                If the application is invalid (i.e. the server is ineligible for joining the network), do not delete the application. Leave it there for
                historical records and edit the status (tag) to <b>rejected</b> manually.
            </p>
            <p>
                To rename the applicant, use <code>/application rename</code>. This will apply to any polls related to this applicant retroactively and going
                forward, and will also rename the thread and edit the application embed. You can also rename the thread manually, but it will not apply the
                other edits.
            </p>
            <p>
                After an application has been pending for 3 days and there will not be a vote to reject without observing, an observer may be assigned. Note
                that even if a vote to decline observation is started and fails (i.e. the council votes to proceed with observation), you must still wait until
                3 days have passed since the application was posted (otherwise, an astute applicant could identify that a counter-vote had been started).
            </p>
            <p>
                When you begin observation, edit the thread tag to the <b>observing</b> status. You may optionally edit the thread name to indicate that you are
                observing it (the informal consensus for formatting is <code>Name - [MM/DD - MM/DD] [Observer]</code>).
            </p>
            <p>
                When observation is done, you can edit the thread tag to the <b>observation finished</b> status, but you will be able to start an induction vote
                even if you don&apos;t remember to do this.
            </p>
            <p>
                To start votes related to an applicant, run <code>/application start-vote</code> in its thread. The applicant&apos;s status (thread tag) will
                automatically be updated when the vote resolves, but the bot will never contact the applicant and an observer must contact them manually. The
                following vote types exist:
            </p>
            <ul>
                <li>
                    <b>Decline Observation &amp; Reject:</b> when an application is pending, the council can vote to reject it without granting it an
                    observation. This poll cannot be repeated if the council votes to proceed with observation.
                </li>
                <li>
                    <b>Cancel Ongoing Observation &amp; Reject:</b> when an applicant is undergoing observation, the council can vote to reject it immediately,
                    canceling its ongoing observation. This poll can be repeated if the council votes to continue observing.
                </li>
                <li>
                    <b>Induction:</b> when observation is finished and the report has been published for at least 24 hours, an induction vote may be started.
                    The following sub-types exist:
                    <ul>
                        <li>
                            <b>Standard:</b> when the server&apos;s mascot is confirmed to be a playable character, the initial vote should be standard. If you
                            realize this is a mistake afterwards, you can use the <b>Add Pre-Approve Option</b> option in the voting menu to change this to an
                            unconfirmed character vote, but if it has been more than a few minutes, it is recommended to delete the poll and run it again to
                            purge any existing votes.
                        </li>
                        <li>
                            <b>Unconfirmed Character:</b> when the server&apos;s mascot is not confirmed to be a playable character, this should be the initial
                            vote, allowing the council to vote to pre-approve the server. If the mascot becomes confirmed during this vote, use the{" "}
                            <b>Remove Pre-Approve Option</b> option in the voting menu to change this to a standard vote. Any exisitng pre-approve votes will be
                            counted as induct votes (but will not be converted, so if the poll is converted back, the votes will be counted as pre-approve votes
                            again).
                        </li>
                        <li>
                            <b>Tiebreak Induct / Pre-Approve:</b> If the initial vote tied between the induct and pre-approve options (only applicable for
                            unconfirmed character votes), run this vote as the tiebreaker.
                        </li>
                        <li>
                            <b>Tiebreak Reject / Extend:</b> If the initial vote tied between the reject and extend observation options, run this vote as the
                            tiebreaker.
                        </li>
                    </ul>
                </li>
            </ul>
            <p>
                The application thread&apos;s status (tag) will be checked and automatically updated when votes are started, resolved, or deleted. If the status
                is wrong for any reason, you can fix it by just editing the thread tag; the bot uses the tag as the single source of truth and does not keep
                track internally.
            </p>
            <a href="/admin/onboarding/technical/global">
                <Button className="flex items-center gap-2">
                    Global Chat <FaAngleRight></FaAngleRight>
                </Button>
            </a>
        </Prose>
    );
}
