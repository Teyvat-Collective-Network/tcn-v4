import { FaAngleRight, FaAnglesLeft, FaHashtag } from "react-icons/fa6";
import { Button } from "../../../../../../components/ui/button";
import Mention from "../../../../../../components/ui/mention";
import { Prose } from "../../../../../../components/ui/prose";

export default function OnboardingTechnicalTickets() {
    return (
        <Prose>
            <h1>Onboarding &mdash; Technical &mdash; Tickets</h1>
            <a href="/admin/onboarding/technical">
                <Button className="flex items-center gap-2">
                    <FaAnglesLeft /> Return to Technical Guide Home
                </Button>
            </a>
            <p>
                Tickets can be opened by all council members using the prompt in{" "}
                <Mention>
                    <FaHashtag /> contact-observers
                </Mention>
                . Tickets are text channels named after whoever opened them and will be logged in{" "}
                <Mention>
                    <FaHashtag /> ticket-logs
                </Mention>{" "}
                when they are created or closed.
            </p>
            <p>
                Within a ticket channel, all observers and the contact who opened it can see and talk in the channel. If you need to discuss privately, use{" "}
                <Mention>
                    <FaHashtag /> exec-management
                </Mention>{" "}
                before responding.
            </p>
            <p>
                All messages will be logged, including edits and deletions. You can read the logs using the link that is sent to{" "}
                <Mention>
                    <FaHashtag /> ticket-logs
                </Mention>{" "}
                when a ticket is closed.
            </p>
            <p>
                To close a ticket, use <code>/ticket close</code>. This can be used by the contact as well.
            </p>
            <p>
                To open a ticket with a user, open one yourself using the prompt and rename it to the user&apos;s name, add them to the channel manually, and
                ping them there. When the ticket is closed, it will be logged and it will say that it is your ticket.
            </p>
            <a href="/admin/onboarding/technical/modmail">
                <Button className="flex items-center gap-2">
                    Modmail <FaAngleRight />
                </Button>
            </a>
        </Prose>
    );
}
