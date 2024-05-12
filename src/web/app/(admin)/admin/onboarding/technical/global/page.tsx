import { FaAngleLeft, FaAngleRight, FaAnglesLeft } from "react-icons/fa6";
import { Button } from "../../../../../../components/ui/button";
import { Prose } from "../../../../../../components/ui/prose";

export default function OnboardingTechnicalGlobal() {
    return (
        <Prose>
            <h1>Onboarding &mdash; Technical &mdash; Global Chat</h1>
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
            {/* TODO: */}
            <a href="/admin/onboarding/technical/banshares">
                <Button className="flex items-center gap-2">
                    Banshares <FaAngleRight />
                </Button>
            </a>
        </Prose>
    );
}
