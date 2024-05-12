import { FaAngleLeft, FaAngleRight, FaAnglesLeft, FaAt, FaHashtag } from "react-icons/fa6";
import { Button } from "../../../../../../components/ui/button";
import Mention from "../../../../../../components/ui/mention";
import { Prose } from "../../../../../../components/ui/prose";

export default function OnboardingTechnicalModmail() {
    return (
        <Prose>
            <h1>Onboarding &mdash; Technical &mdash; Modmail</h1>
            <div className="flex items-center gap-4">
                <a href="/admin/onboarding/technical">
                    <Button className="flex items-center gap-2">
                        <FaAnglesLeft /> Return to Technical Guide Home
                    </Button>
                </a>
                <a href="/admin/onboarding/technical/tickets">
                    <Button className="flex items-center gap-2">
                        <FaAngleLeft /> Tickets
                    </Button>
                </a>
            </div>
            <p>
                Modmail can be oppened by users in the TCN Hub by DMing the modmail bot. You can also open a modmail thread with a user using{" "}
                <code>/modmail contact</code>. This will not notify them until you send a message.
            </p>
            <p>
                Self-assign the{" "}
                <Mention>
                    <FaAt /> Modmail Ping
                </Mention>{" "}
                role if you wish to be pinged when modmail threads are opened.
            </p>
            <p>
                To reply to the user, use <code>/modmail reply</code>. You can specify content, up to ten files, and optionally reply anonymously. If you need
                to respond with a multi-line message, use <code>/modmail reply-modal</code>, which prompts you to input the content in a pop-up modal.
            </p>
            <p>
                Snippets allow pre-configured messages to be sent. Use <code>/modmail snippet view</code> to check the contents of a snippet,{" "}
                <code>/modmail snippet send</code> to use one as a reply, and <code>/modmail snipppet use-as-template</code> to bring up a pop-up with the
                snippet&apos;s content, which you can edit before sending.
            </p>
            <p>
                To close a modmail thread, use <code>/modmail close</code>. This is anonymous if you choose to notify the user and you can customize the close
                message. You can also set a delay, in which case the user will be notified that the thread will close after the elapsed time period. Your choice
                of whether or not to notify and what custom message to send will apply when the thread closes, not when the closure is scheduled.
            </p>
            <p>
                <Mention>
                    <FaHashtag /> modmail-log
                </Mention>{" "}
                contains links to the modmail logs, which contain all relayed messages, including edits, and internal messages sent within the thread but not to
                the user. You can also obtain this link ahead of time using <code>/modmail log-link</code>.
            </p>
            <a href="/admin/onboarding/technical/suggestions">
                <Button className="flex items-center gap-2">
                    Suggestions <FaAngleRight />
                </Button>
            </a>
        </Prose>
    );
}
