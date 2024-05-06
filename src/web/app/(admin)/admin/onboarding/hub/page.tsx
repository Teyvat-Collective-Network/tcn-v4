import { FaAngleLeft, FaAngleRight, FaAnglesLeft, FaBullhorn, FaComments, FaFolderOpen, FaHashtag } from "react-icons/fa6";
import { Button } from "../../../../../components/ui/button";
import Mention from "../../../../../components/ui/mention";
import { Prose } from "../../../../../components/ui/prose";

export default function OnboardingGuideTCNHub() {
    return (
        <Prose>
            <h1>Observer Onboarding &mdash; TCN Hub</h1>
            <div className="flex items-center gap-4">
                <a href="/admin/onboarding">
                    <Button className="flex items-center gap-2">
                        <FaAnglesLeft></FaAnglesLeft> Return to Onboarding Home
                    </Button>
                </a>
                <a href="/admin/onboarding/responsibilities">
                    <Button className="flex items-center gap-2">
                        <FaAngleLeft></FaAngleLeft> Responsibilities
                    </Button>
                </a>
            </div>
            <p>
                Remember that the Hub is also a very important component of the TCN as it is a public resource center and our main line of communication with
                the public. Here is a quick list of things in the Hub to keep an eye on.
            </p>
            <ul>
                <li>
                    <Mention>
                        <FaHashtag></FaHashtag> partner-list
                    </Mention>{" "}
                    contains an automatically synced version of the embed. The only difference with the standard embed is that the section about the TCN Hub is
                    removed here. This is a good place to ensure autosync is working correctly.
                </li>
                <li>
                    <Mention>
                        <FaBullhorn></FaBullhorn> announcements
                    </Mention>{" "}
                    should be used to announce all important information in line with the communication standards outlined below.
                </li>
                <li>
                    <Mention>
                        <FaHashtag></FaHashtag> network-events
                    </Mention>{" "}
                    receives published items from HQ&apos;s{" "}
                    <Mention>
                        <FaBullhorn></FaBullhorn> network-events
                    </Mention>
                    .
                </li>
                <li>
                    <Mention>
                        <FaHashtag></FaHashtag> banshares
                    </Mention>{" "}
                    receives published banshares and acts like any other banshare-receiving server. It is visible to all registered staff in the network. Note
                    that banshares are never executed as the Hub is used for ban appeals. Rescind messages will also be forwarded here.
                </li>
                <li>
                    <Mention>
                        <FaFolderOpen></FaFolderOpen> Hub Moderator HQ
                    </Mention>{" "}
                    is used for moderation of the Hub and includes the modmail channel (
                    <a href="/admin/onboarding/technical/modmail" className="link" target="_blank">
                        learn more
                    </a>
                    ).
                </li>
                <li>
                    <Mention>
                        <FaFolderOpen></FaFolderOpen> Global Mod HQ
                    </Mention>{" "}
                    is used for global chat moderation. For more information, see the{" "}
                    <a href="/global/onboarding" className="link" target="_blank">
                        Global Mod Onboarding Guide
                    </a>
                    .
                </li>
                <li>
                    <Mention>
                        <FaFolderOpen></FaFolderOpen>
                    </Mention>{" "}
                    contains all of the logging features supported by{" "}
                    <a href="https://daedalusbot.xyz" className="link" target="_blank">
                        Daedalus
                    </a>
                    .
                </li>
                <li>
                    <Mention>
                        <FaComments></FaComments> questions
                    </Mention>{" "}
                    is for general questions &mdash; monitor this and answer any questions the public has.
                </li>
                <li>
                    <Mention>
                        <FaHashtag></FaHashtag> suggestions
                    </Mention>{" "}
                    works just like in HQ (
                    <a href="/admin/onboarding/technical/suggestions" className="link" target="_blank">
                        learn more
                    </a>
                    ).
                </li>
                <li>
                    <Mention>
                        <FaHashtag></FaHashtag> tavern-collab
                    </Mention>{" "}
                    is the collaboration channel with Genshin Impact Tavern. Make sure you monitor for event collaboration offers to relay and event cross-post
                    requests.
                </li>
            </ul>
            <a href="/admin/onboarding/technical">
                <Button className="flex items-center gap-2">
                    Technical <FaAngleRight></FaAngleRight>
                </Button>
            </a>
        </Prose>
    );
}
