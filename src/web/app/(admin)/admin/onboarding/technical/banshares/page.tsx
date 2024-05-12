import { FaAngleLeft, FaAngleRight, FaAnglesLeft, FaAt, FaHashtag } from "react-icons/fa6";
import { Button } from "../../../../../../components/ui/button";
import Mention from "../../../../../../components/ui/mention";
import { Prose } from "../../../../../../components/ui/prose";

export default function OnboardingTechnicalBanshares() {
    return (
        <Prose>
            <h1>Onboarding &mdash; Technical &mdash; Banshares</h1>
            <div className="flex items-center gap-4">
                <a href="/admin/onboarding/technical">
                    <Button className="flex items-center gap-2">
                        <FaAnglesLeft /> Return to Technical Guide Home
                    </Button>
                </a>
                <a href="/admin/onboarding/technical/global">
                    <Button className="flex items-center gap-2">
                        <FaAngleLeft /> Global Chat
                    </Button>
                </a>
            </div>
            <p>
                When banshares are submitted, an alert will be sent to{" "}
                <Mention>
                    <FaHashtag /> exec-management
                </Mention>{" "}
                pinging{" "}
                <Mention>
                    <FaAt /> Banshare Ping
                </Mention>{" "}
                (you can self-assign this role) if non-urgent and{" "}
                <Mention>
                    <FaAt /> Observer
                </Mention>{" "}
                if urgent.
            </p>
            <p>
                You can always check an up-to-date list of banshares awaiting review in{" "}
                <Mention>
                    <FaHashtag /> banshare-dashboard
                </Mention>
                . If a banshare is left unreviewed for too long (6 hours for non-urgent banshares and 2 hours for urgent banshares), an alert pinging{" "}
                <Mention>
                    <FaAt /> Observer
                </Mention>{" "}
                will be sent.
            </p>
            <p>
                Banshares can be locked by anyone, signifying that they wish to bring up something to do with the banshare. A log message will be sent
                indicating who locked the banshare, so if you do not see them typing or saying anything, you may wish to ping/DM them to see if they meant to
                lock it. This is to allow members to immediately communicate that they want to say something and prevent the banshare from being published
                before they have the change to send a message.
            </p>
            <p>The lock can only be removed by an observer and should only be removed once the issue is resolved.</p>
            <p>Clicking the buttons in the second row, you can change the severity of a banshare before publishing it.</p>
            <p>
                Rejecting a banshare will not prompt for confirmation, as it is also reversible. This just indicates that you&apos;ve marked the banshare as
                rejected and both prevents it from being published and stops reminders from being sent. You can restore a rejected banshare, returning it to the
                pending status.
            </p>
            <p>
                Publishing a banshare will prompt for confirmation as it cannot be directly reverted. Once a banshare is published, it can be rescinded, but
                this should rarely be done; generally if a banshare is rescinded it means something went wrong in the review process that allowed a banshare to
                be published when it shouldn&apos;t have been.
            </p>
            <p>
                When rescinding a banshare, you will need to provide an explanation, which will show up in the banshare channel in HQ and the Hub as well as
                every server that received the banshare. If you rescind a banshare right after publishing, it will cancel any pending publication and autoban
                tasks but some actions will have occurred already.
            </p>
            <a href="/admin/onboarding/technical/votes">
                <Button className="flex items-center gap-2">
                    Votes <FaAngleRight />
                </Button>
            </a>
        </Prose>
    );
}
