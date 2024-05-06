import { FaAngleLeft, FaAngleRight, FaAnglesLeft } from "react-icons/fa6";
import { Button } from "../../../../../components/ui/button";
import { Prose } from "../../../../../components/ui/prose";

export default function OnboardingGuideResponsibilities() {
    return (
        <Prose>
            <h1>Observer Onboarding &mdash; Responsibilities</h1>
            <div className="flex items-center gap-4">
                <a href="/admin/onboarding">
                    <Button className="flex items-center gap-2">
                        <FaAnglesLeft></FaAnglesLeft> Return to Onboarding Home
                    </Button>
                </a>
                <a href="/admin/onboarding/directory">
                    <Button className="flex items-center gap-2">
                        <FaAngleLeft></FaAngleLeft> Directory
                    </Button>
                </a>
            </div>
            <p>
                The purpose of this document is to create a list of roles and areas that are primarily observer-driven. Not all observers need to take on all of
                these responsibilities, as long as everything is being done. Additionally, this is not meant as a restrictive or complete document, and as an
                observer, you are positioned to look for areas of improvement.
            </p>
            <h2>Routine Tasks</h2>
            <ul>
                <li>
                    <b>Elections:</b> ensure elections are run on a timely basis.
                </li>
                <li>
                    <b>Banshares:</b> ensure banshares are reviewed on a timely basis and oversee quality standards.
                </li>
            </ul>
            <h2>Internal Affairs</h2>
            <ul>
                <li>
                    <b>Feedback:</b> ensure suggestions and other feedback are heard, discussed, and considered/implement within a reasonable time frame (
                    <a href="/admin/onboarding/technical/suggestions" className="link" target="_blank">
                        learn how to handle suggestions
                    </a>
                    ).
                </li>
                <li>
                    <b>Discussions:</b> keep discussions moving forward and remain constructive, drive discussions through phases (e.g. brainstorming &rarr;
                    scoping &rarr; finalizing), and summarize as appropriate.
                </li>
                <li>
                    <b>Mediation:</b> moderate discussions and ensure civility where needed.
                </li>
                <li>
                    <b>Tickets:</b> ensure tickets are addressed adequately (
                    <a href="/admin/onboarding/technical/tickets" className="link" target="_blank">
                        learn more
                    </a>
                    ).
                </li>
            </ul>
            <h2>External Affairs</h2>
            <ul>
                <li>
                    <b>Modmail:</b> ensure modmail threads are addressed adequately (
                    <a href="/admin/onboarding/technical/modmail" className="link" target="_blank">
                        learn more
                    </a>
                    ).
                </li>
                <li>
                    <b>Partnerships:</b> oversee standards for third-party partnerships, relay communications regarding details and conditions, and monitor
                    partners to ensure continued upholding of standards/agreements.
                </li>
                <li>
                    <b>Hub Quality Assurance:</b> ensure outgoing communications in the TCN Hub are conducted appropriately (
                    <a href="/admin/onboarding/hub" className="link" target="_blank">
                        learn more
                    </a>
                    ) and inquiries (questions, feedback, etc.) are addressed.
                </li>
            </ul>
            <h2>Global Chat</h2>
            <ul>
                <li>
                    <b>Moderation:</b> oversee moderation standards, maintain the global chat filter, and review applications for the global chat moderator
                    team.
                </li>
                <li>
                    <b>Operations:</b> ensure functionality.
                </li>
            </ul>
            <h2>Technical</h2>
            <ul>
                <li>
                    <b>Security:</b> monitor for potential security flaws, respond to user-reported vulnerabilities, and ensure responsible reporting and
                    security.
                </li>
                <li>
                    <b>Monitoring:</b> monitor for undefined or unintended behavior, bugs, latency issues, etc. and monitor usage to seek opportunities for
                    proactive improvements and optimizations.
                </li>
                <li>
                    <b>Implementation:</b> implement security fixes, bug fixes, and new features.
                </li>
            </ul>
            <a href="/admin/onboarding/hub">
                <Button className="flex items-center gap-2">
                    TCN Hub <FaAngleRight></FaAngleRight>
                </Button>
            </a>
        </Prose>
    );
}
