"use client";

import { LandingPage, LandingPanel } from "../../../components/ui/landing-page";
import { useUserContext } from "../../../context/user";

export default function GlobalHome() {
    const user = useUserContext();

    return (
        <LandingPage>
            <LandingPanel href="/global/onboarding">
                <h2>Onboarding</h2>
                <p>Get started with the Global Chat system.</p>
            </LandingPanel>
            <LandingPanel href="/global/moderation">
                <h2>Moderation</h2>
                <p>
                    Learn our moderation philosophy and guidelines here. This is mainly applicable to the main channel mods but can be useful for other
                    channels.
                </p>
            </LandingPanel>
            <LandingPanel href="/global/moderator-agreement">
                <h2>Moderator Agreement</h2>
                <p>This agreement only applies to the main channel mods.</p>
            </LandingPanel>
            {user?.observer ? (
                <>
                    <LandingPanel href="/global/channels">
                        <h2>Channels</h2>
                        <p>Create and manage global channels here.</p>
                    </LandingPanel>
                    <LandingPanel href="/global/filters">
                        <h2>Chat Filters</h2>
                        <p>Manage global chat filter modules here.</p>
                    </LandingPanel>
                </>
            ) : null}
        </LandingPage>
    );
}
