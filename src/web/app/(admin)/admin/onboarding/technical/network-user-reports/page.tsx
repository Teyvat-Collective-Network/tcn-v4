import { FaAngleLeft, FaAngleRight, FaAnglesLeft, FaAt, FaHashtag } from "react-icons/fa6";
import { Button } from "../../../../../../components/ui/button";
import Mention from "../../../../../../components/ui/mention";
import { Prose } from "../../../../../../components/ui/prose";

export default function OnboardingTechnicalNetworkUserReports() {
    return (
        <Prose>
            <h1>Onboarding &mdash; Technical &mdash; Network User Reports</h1>
            <div className="flex items-center gap-4">
                <a href="/admin/onboarding/technical">
                    <Button className="flex items-center gap-2">
                        <FaAnglesLeft /> Return to Technical Guide Home
                    </Button>
                </a>
                <a href="/admin/onboarding/technical/applications">
                    <Button className="flex items-center gap-2">
                        <FaAngleLeft /> Applications
                    </Button>
                </a>
            </div>
            <p>
                When network user reports are submitted, an alert will be sent to{" "}
                <Mention>
                    <FaHashtag /> exec-management
                </Mention>{" "}
                pinging{" "}
                <Mention>
                    <FaAt /> Network User Reports Ping
                </Mention>{" "}
                (you can self-assign this role) if non-urgent and{" "}
                <Mention>
                    <FaAt /> Observer
                </Mention>{" "}
                if urgent.
            </p>
            <p>
                You can always check an up-to-date list of reports awaiting review in{" "}
                <Mention>
                    <FaHashtag /> reports-dashboard
                </Mention>
                . If a report is left unreviewed for too long (6 hours for non-urgent reports and 2 hours for urgent reports), an alert pinging{" "}
                <Mention>
                    <FaAt /> Observer
                </Mention>{" "}
                will be sent.
            </p>
            <p>
                Reports can be locked by anyone, signifying that they wish to bring up something to do with the report. A log message will be sent indicating
                who locked the report, so if you do not see them typing or saying anything, you may wish to ping/DM them to see if they meant to lock it. This
                is to allow members to immediately communicate that they want to say something and prevent the report from being published before they have the
                change to send a message.
            </p>
            <p>The lock can only be removed by an observer and should only be removed once the issue is resolved.</p>
            <p>Clicking the buttons in the second row, you can change the severity of a report before publishing it.</p>
            <p>
                Rejecting a report will not prompt for confirmation, as it is also reversible. This just indicates that you&apos;ve marked the report as
                rejected and both prevents it from being published and stops reminders from being sent. You can restore a rejected report, returning it to the
                pending status.
            </p>
            <p>
                Publishing a report will prompt for confirmation as it cannot be directly reverted. Once a report is published, it can be rescinded, but this
                should rarely be done; generally if a report is rescinded it means something went wrong in the review process that allowed a report to be
                published when it shouldn&apos;t have been.
            </p>
            <p>
                When rescinding a report, you will need to provide an explanation, which will show up in the report channel in HQ and the Hub as well as every
                server that received the report. If you rescind a report right after publishing, it will cancel any pending publication and autoban tasks but
                some actions will have occurred already.
            </p>
            <a href="/admin/onboarding/technical/votes">
                <Button className="flex items-center gap-2">
                    Votes <FaAngleRight />
                </Button>
            </a>
        </Prose>
    );
}
