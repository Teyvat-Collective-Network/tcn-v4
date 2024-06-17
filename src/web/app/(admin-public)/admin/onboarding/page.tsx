import { LandingPage, LandingPanel } from "../../../../components/ui/landing-page";
import { Prose } from "../../../../components/ui/prose";

export default function OnboardingGuide() {
    return (
        <>
            <Prose>
                <h1>TCN Observer Onboarding Guide</h1>
                <p>
                    Welcome to the TCN Observer Onboarding Guide! This resource is divided into a hierarchal setup so you can revisit sections more easily.
                    Don&apos;t try to memorize all of this &mdash; we recommend that you skim through it at first to get a rough understanding of what to expect
                    and read over it more thoroughly once you&apos;ve settled in a bit and refer back to it whenever you need to.
                </p>
            </Prose>
            <br />
            <LandingPage>
                <LandingPanel href="/admin/onboarding/critical">
                    <h2>Critical Information</h2>
                    <p>This is some very crucial information that you must know.</p>
                </LandingPanel>
                <LandingPanel href="/admin/onboarding/expectations">
                    <h2>Expectations</h2>
                    <p>Learn about what&apos;s expected of you as an observer.</p>
                </LandingPanel>
                <LandingPanel href="/admin/onboarding/directory">
                    <h2>Directory</h2>
                    <p>Here, you&apos;ll find a list of observer-only roles and channels.</p>
                </LandingPanel>
                <LandingPanel href="/admin/onboarding/responsibilities">
                    <h2>Responsibilities</h2>
                    <p>This outlines your routine responsibilities.</p>
                </LandingPanel>
                <LandingPanel href="/admin/onboarding/hub">
                    <h2>TCN Hub</h2>
                    <p>The TCN Hub is an important part of the network. Learn more about it here.</p>
                </LandingPanel>
                <LandingPanel href="/admin/onboarding/technical">
                    <h2>Technical</h2>
                    <p>This goes in-depth through the technical usage of the network&apos;s systems.</p>
                </LandingPanel>
            </LandingPage>
        </>
    );
}
