import { FaAngleLeft, FaAnglesLeft } from "react-icons/fa6";
import { Button } from "../../../../../../components/ui/button";
import { Prose } from "../../../../../../components/ui/prose";

export default function OnboardingTechnicalElections() {
    return (
        <Prose>
            <h1>Onboarding &mdash; Technical &mdash; Elections</h1>
            <div className="flex items-center gap-4">
                <a href="/admin/onboarding/technical">
                    <Button className="flex items-center gap-2">
                        <FaAnglesLeft></FaAnglesLeft> Return to Technical Guide Home
                    </Button>
                </a>
                <a href="/admin/onboarding/technical/votes">
                    <Button className="flex items-center gap-2">
                        <FaAngleLeft></FaAngleLeft> Votes
                    </Button>
                </a>
            </div>
        </Prose>
    );
}
