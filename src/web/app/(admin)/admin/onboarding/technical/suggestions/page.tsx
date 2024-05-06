import { FaAngleLeft, FaAngleRight, FaAnglesLeft, FaHashtag } from "react-icons/fa6";
import { Button } from "../../../../../../components/ui/button";
import Mention from "../../../../../../components/ui/mention";
import { Prose } from "../../../../../../components/ui/prose";

export default function OnboardingTechnicalSuggestions() {
    return (
        <Prose>
            <h1>Onboarding &mdash; Technical &mdash; Suggestions</h1>
            <div className="flex items-center gap-4">
                <a href="/admin/onboarding/technical">
                    <Button className="flex items-center gap-2">
                        <FaAnglesLeft></FaAnglesLeft> Return to Technical Guide Home
                    </Button>
                </a>
                <a href="/admin/onboarding/technical/modmail">
                    <Button className="flex items-center gap-2">
                        <FaAngleLeft></FaAngleLeft> Modmail
                    </Button>
                </a>
            </div>
            <p>
                In both HQ and the TCN Hub, users can make suggestions to{" "}
                <Mention>
                    <FaHashtag></FaHashtag> suggestions
                </Mention>{" "}
                using <code>/suggest</code>. Other users can then vote on the suggestion.
            </p>
            <p>
                To update the status of a suggestion, use <code>/suggestion update</code>. You must pick a status (implemented, approved, considered, denied)
                and enter the ID (the title of the suggestion post contains its numerical ID).
            </p>
            <p>
                You may optionally provide an explanation which will be appended to the suggestion post. You may also choose to send a DM to the user, which
                will include the explanation if set. Finally, you can enable anonymous mode to hide your identity in the suggestion embed.
            </p>
            <a href="/admin/onboarding/technical/applications">
                <Button className="flex items-center gap-2">
                    Applications <FaAngleRight></FaAngleRight>
                </Button>
            </a>
        </Prose>
    );
}
