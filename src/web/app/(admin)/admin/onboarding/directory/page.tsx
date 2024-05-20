import { FaAngleLeft, FaAngleRight, FaAnglesLeft, FaAt, FaComments, FaFolderOpen, FaHashtag, FaVolumeHigh } from "react-icons/fa6";
import { Button } from "../../../../../components/ui/button";
import Mention from "../../../../../components/ui/mention";
import { Prose } from "../../../../../components/ui/prose";

export default function OnboardingGuideDirectory() {
    return (
        <Prose>
            <h1>Observer Onboarding &mdash; Directory</h1>
            <div className="flex items-center gap-4">
                <a href="/admin/onboarding">
                    <Button className="flex items-center gap-2">
                        <FaAnglesLeft /> Return to Onboarding Home
                    </Button>
                </a>
                <a href="/admin/onboarding/expectations">
                    <Button className="flex items-center gap-2">
                        <FaAngleLeft /> Expectations
                    </Button>
                </a>
            </div>
            <p>The following channels are only visible to observers and are important for you to know about:</p>
            <ul>
                <li>
                    <Mention>
                        <FaHashtag /> important
                    </Mention>{" "}
                    &mdash; This channel contains some important links.
                </li>
                <li>
                    <Mention>
                        <FaHashtag /> exec-management
                    </Mention>{" "}
                    &mdash; This is the main private observer channel. This is not exclusively a business channel &mdash; feel free to chat with the other
                    observers here. Keep in mind that we also have{" "}
                    <Mention>
                        <FaHashtag /> observer-chat
                    </Mention>
                    , a public channel, which may be more suitable for some discussions or information.
                </li>
                <li>
                    <Mention>
                        <FaHashtag /> nsfw-evidence
                    </Mention>{" "}
                    &mdash; This is for posting evidence for topics in discussion that are too NSFW to post in regular channels. Be warned that this may contain
                    disturbing/disgusting content and not just sexually explicit content.
                </li>
                <li>
                    <Mention>
                        <FaHashtag /> exec-bot-spam
                    </Mention>{" "}
                    &mdash; This is the private bot spam / bot command channel.
                </li>
                <li>
                    <Mention>
                        <FaComments /> exec-projects
                    </Mention>{" "}
                    &mdash; This is a forum for ongoing projects that do not concern the public. Feel free to open new posts here.
                </li>
                <li>
                    <Mention>
                        <FaHashtag /> ticket-logs
                    </Mention>{" "}
                    &mdash; This is the log channel for tickets. Keep an eye on the text channels below this, which are the tickets themselves. Learn more about
                    using these on{" "}
                    <a href="/admin/onboarding/technical/tickets" className="link" target="_blank">
                        this page
                    </a>
                    .
                </li>
                <li>
                    <Mention>
                        <FaVolumeHigh /> Observer Voice Chat
                    </Mention>{" "}
                    &mdash; This is the observer-only voice channel and may be used for meetings, discussions, or just chatting.
                </li>
                <li>
                    <Mention>
                        <FaFolderOpen /> Logs
                    </Mention>{" "}
                    &mdash; This category contains log channels.
                    <ul>
                        <li>
                            <Mention>
                                <FaHashtag /> message-logs
                            </Mention>{" "}
                            logs message edits and deletions.
                        </li>
                        <li>
                            <Mention>
                                <FaHashtag /> member-logs
                            </Mention>{" "}
                            logs updates to members (role, avatar, and nickname changes).
                        </li>
                        <li>
                            <Mention>
                                <FaHashtag /> server-logs
                            </Mention>{" "}
                            logs edits to the server (including roles, channels, etc.).
                        </li>
                        <li>
                            <Mention>
                                <FaHashtag /> bot-logs
                            </Mention>{" "}
                            is the output for the main bot and functions as a debug/audit channel.
                        </li>
                    </ul>
                </li>
            </ul>
            <p>The following roles are available to you to self-assign if you want pings for certain things. These are all optional.</p>
            <ul>
                <li>
                    <Mention>
                        <FaAt /> Ticket Ping
                    </Mention>{" "}
                    &mdash; pinged when tickets are opened via{" "}
                    <Mention>
                        <FaHashtag /> contact-observers
                    </Mention>
                    .
                </li>
                <li>
                    <Mention>
                        <FaAt /> Network User Reports Ping
                    </Mention>{" "}
                    &mdash; pinged when network user reports are submitted to{" "}
                    <Mention>
                        <FaHashtag /> network-user-reports
                    </Mention>{" "}
                    (urgent reports will ping all observers).
                </li>
            </ul>
            <a href="/admin/onboarding/responsibilities">
                <Button className="flex items-center gap-2">
                    Responsibilities <FaAngleRight />
                </Button>
            </a>
        </Prose>
    );
}
