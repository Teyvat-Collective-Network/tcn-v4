import { FaAngleLeft, FaAngleRight, FaAnglesLeft } from "react-icons/fa6";
import { Button } from "../../../../../../components/ui/button";
import { Prose } from "../../../../../../components/ui/prose";

export default function OnboardingTechnicalVotes() {
    return (
        <Prose>
            <h1>Onboarding &mdash; Technical &mdash; Votes</h1>
            <div className="flex items-center gap-4">
                <a href="/admin/onboarding/technical">
                    <Button className="flex items-center gap-2">
                        <FaAnglesLeft></FaAnglesLeft> Return to Technical Guide Home
                    </Button>
                </a>
                <a href="/admin/onboarding/technical/banshares">
                    <Button className="flex items-center gap-2">
                        <FaAngleLeft></FaAngleLeft> Banshares
                    </Button>
                </a>
            </div>
            <h2>All Votes</h2>
            <p>In every poll, the following four options will appear at the bottom:</p>
            <ul>
                <li>
                    <b>View My Vote:</b> allows a voter to view their current vote.
                </li>
                <li>
                    <b>Info:</b> shows some information about votes and this specific vote type, including who can vote, quorum requirements, what the options
                    mean, and how to vote (if it is not obvious).
                </li>
                <li>
                    <b>Delete:</b> allows observers to delete a poll entirely, also purging all votes, removing the DM reminder and reverting automated actions,
                    and removing it from counting for activity checks (prompts confirmation).
                </li>
                <li>
                    <b>Reset Deadline:</b> resets a poll&apos;s deadline to two days from the present time and moves the DM reminder to one day from the present
                    time (even if it has already triggered). This can be used for a poll that is already closed, but it will not trigger automated actions that
                    occur on-open (it will still trigger on-close actions when its deadline is reached).
                </li>
            </ul>
            <h2>Applications</h2>
            <p>
                Votes for the application process can be set up automatically. Refer to the{" "}
                <a href="/admin/onboarding/technical/applications" className="link">
                    application workflow page
                </a>{" "}
                for more information.
            </p>
            <a href="/admin/onboarding/technical/elections">
                <Button className="flex items-center gap-2">
                    Elections <FaAngleRight></FaAngleRight>
                </Button>
            </a>
        </Prose>
    );
}
