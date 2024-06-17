import { FaAngleRight, FaAnglesLeft } from "react-icons/fa6";
import { Button } from "../../../../../components/ui/button";
import { Prose } from "../../../../../components/ui/prose";

export default function OnboardingGuideCritical() {
    return (
        <Prose>
            <h1>Observer Onboarding &mdash; Critical Information</h1>
            <a href="/admin/onboarding">
                <Button className="flex items-center gap-2">
                    <FaAnglesLeft /> Return to Onboarding Home
                </Button>
            </a>
            <p>
                The TCN HQ server is protected by Daedalus&apos; nukeguard feature, which is configured to quarantine (i.e. temporarily ban) anyone who deletes
                channels and most roles. All channels and most important roles are protected, though server-specific color roles are not and you can delete
                those.
            </p>
            <p>
                This protection exists as a safeguard against compromised accounts and additionally guards against the small chance that a bot is compromised or
                becomes malicious.
            </p>
            <p>If a channel or role needs to be deleted, it will need to be discussed first, and the owner of HQ can safely remove it.</p>
            <a href="/admin/onboarding/expectations">
                <Button className="flex items-center gap-2">
                    Expectations <FaAngleRight />
                </Button>
            </a>
        </Prose>
    );
}
