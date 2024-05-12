import { FaAnglesLeft } from "react-icons/fa6";
import { Section } from "../../../../components/section";
import { Button } from "../../../../components/ui/button";
import { Prose } from "../../../../components/ui/prose";
import UserMention from "../../../../components/ui/user-mention";

export default function DocsGlobalChatRules() {
    return (
        <Prose>
            <h1>Docs &mdash; Global Chat Rules</h1>
            <a href="/docs">
                <Button className="flex items-center gap-2">
                    <FaAnglesLeft /> Return to Docs Home
                </Button>
            </a>
            <p>
                These rules are not intended as a comprehensive list of permitted and forbidden behavior, but as a general guideline on acceptable conduct. You
                are expected to use your own common sense judgement, and moderators may act outside of the rules at their discretion within reason.
            </p>
            <p>
                Disputes regarding interpretations of the rules or moderator actions may be sent to modmail in the{" "}
                <a href={process.env.HUB_INVITE} className="link" target="_blank">
                    TCN Hub
                </a>{" "}
                by DMing <UserMention id={process.env.CLIENT_ID!} /> after joining the server.
            </p>
            <p>Inappropriate behavior in DMs or in TCN servers outside of global chat may also result in penalties applied in global chat.</p>
            <Section tag="h2" id="be-nice">
                Rule 1 &mdash; Be Nice
            </Section>
            <ul>
                <li>No harassment, discrimination, personal attacks, hateful language, use of slurs, brigading, witch-hunting, etc.</li>
                <li>
                    In case of other users being disrespectful, disengage from the situation and alert mods if needed; insulting the user back will result in
                    both parties being punished accordingly to their behavior.
                </li>
                <li>Being nice extends to all parties — other members, moderators, users not in the global chat, non-TCN servers, etc.</li>
            </ul>
            <Section tag="h2" id="no-nsfw">
                Rule 2 &mdash; No NSFW/NSFL
            </Section>
            <ul>
                <li>
                    Most connected servers are strict on NSFW, so even if the server from which you are chatting is lenient on this, it still isn&apos;t
                    allowed.
                </li>
                <li>NSFW/NSFL content includes everything - media, text (including usernames), profile avatars, etc. both explicitly and implicitly.</li>
            </ul>
            <Section tag="h2" id="sdflsdkljflkdsjfglksd">
                Rule 3 &mdash; No Leaks/Unmarked Spoilers
            </Section>
            <ul>
                <li>Leaks are not allowed in global channels and should be kept to channels in your server that permit leaks.</li>
                <li>This rule applies to both Genshin Impact and any other games / media.</li>
                <li>Mark spoilers, both for Genshin Impact and otherwise (within reason).</li>
            </ul>
            <Section tag="h2" id="sdflsdkljflkdsjfglksd">
                Rule 4 &mdash; No Drama
            </Section>
            <ul>
                <li>
                    Do not complain about being banned/muted in another server in the global chat &mdash; if you have an issue with a TCN server&apos;s actions,
                    you can contact the TCN via modmail as detailed at the top of this document.
                </li>
                <li>
                    Political and religious conversations are not banned outright, but as they can rapidly start drama, we discourage them as they may get out
                    of your control and result in the conversation being shut down and/or punishments.
                </li>
                <li>Personal drama and server drama, whether or not from within the TCN, is not to be discussed in global chat.</li>
                <li>Do not complain about moderator actions here; contact the TCN via modmail if you wish to dispute actions or punishments.</li>
            </ul>
            <Section tag="h2" id="sdflsdkljflkdsjfglksd">
                Rule 5 &mdash; No Spam
            </Section>
            <ul>
                <li>Do not flood chat; be considerate of others&apos; use of the channel.</li>
                <li>Do not jump around servers just for the sake of it as that is disruptive and causes your consecutive messages to not group together.</li>
            </ul>
            <Section tag="h2" id="sdflsdkljflkdsjfglksd">
                Rule 6 &mdash; No Advertisement
            </Section>
            <ul>
                <li>Do not advertise &mdash; this includes self-promotion, server advertisement, etc.</li>
            </ul>
            <Section tag="h2" id="sdflsdkljflkdsjfglksd">
                Rule 7 &mdash; Use English
            </Section>
            <ul>
                <li>For purposes of moderation, please keep conversations to English only.</li>
                <li>Words, well-known phrases, short snippets, and memes in other languages are permitted.</li>
            </ul>
            <Section tag="h2" id="sdflsdkljflkdsjfglksd">
                Rule 8 &mdash; Listen to Staff
            </Section>
            <ul>
                <li>These rules are guidelines and not intended to be exhaustive.</li>
                <li>Moderators are entrusted to make the final call on situations.</li>
                <li>If you believe a moderator&apos;s actions were in bad faith, counterproductive, or otherwise a mistake, contact the TCN via modmail.</li>
            </ul>
        </Prose>
    );
}
