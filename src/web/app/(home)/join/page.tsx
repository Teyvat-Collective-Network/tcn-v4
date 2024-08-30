"use client";

import { Button } from "../../../components/ui/button";
import { Panel } from "../../../components/ui/panel";
import { Prose } from "../../../components/ui/prose";

export default function Join() {
    return (
        <Prose>
            <h1>Joining the TCN</h1>
            <p>
                Only character mains servers (servers dedicated to a specific Genshin Impact character with resources and channels for that character) may join
                the TCN, but we have no limit on the number of servers for the same character that may join. Your server will undergo a review process, which
                you can read more about{" "}
                <a href="/observation-faq" className="link">
                    here
                </a>
                .
            </p>
            <p>
                We also have some additional requirements. Your server must have at least 100 members <b>and</b> be at least 2 weeks old. It must also have at
                least 500 members <b>or</b> be at least 4 weeks old. The server age requirements are defined by your last rebranding, so if you switched from
                one character mains server to another, you must wait 2 (or 4) weeks.
            </p>
            <p>
                Please read through this page before applying! We want to make sure you are a good fit for us, but we also want to make sure we are a good fit
                for you and what your goals for your server are. If you haven&apos;t already, we recommend reading our{" "}
                <a href="/about" className="link">
                    About Us
                </a>{" "}
                page as well.
            </p>
            <p>
                <a href="/apply">
                    <Button>Apply Here!</Button>
                </a>
            </p>
            <h2>Induction Process</h2>
            <Panel>
                <h3 className="mt-4">Preparation</h3>
                <p>Before applying, make sure your server is well-structured, your staff teams are in order, and you are ready for our evaluation!</p>
                <h3>Application</h3>
                <p>
                    Once you&apos;re ready, fill out the application form! We&apos;ll reach out to you within a few days once we&apos;ve completed internal
                    processes and assigned an observer to your server. If there are any delays, we will reach out to you with continuous updates and a
                    transparent timeline.
                </p>
                <h3>Observation</h3>
                <p>
                    Observation takes 28 days, during which time an observer will oversee all operations in your server, requiring you to grant view access to
                    all channels and the audit logs. This is to ensure your server meets our quality expectations for organization and a safe environment.
                </p>
                <p>
                    Once observation is done, the observer will write a report and share it with you. We will work with you to ensure we accurately portray your
                    server.
                </p>
                <h3>Decision</h3>
                <p>
                    The TCN council will review the observation report and vote on whether or not to induct your server into the TCN. If your server&apos;s
                    character has not been officially confirmed for playability, we may decide that your server is good but hold off until we have confirmation.
                </p>
                <h3>Joining the TCN</h3>
                <p>
                    If you are accepted, congratulations! We will guide you through the required setup (there is very little) and any optional benefits you want
                    to add.
                </p>
                <h3>Rejection</h3>
                <p>
                    If your application is rejected, don&apos; worry &mdash; we&apos;ve had many servers rejected for various reasons that improved and were
                    later accepted into the network. If possible, we&apos;ll inform you why we didn&apops;t accept your application and how to improve or fix
                    any issues.
                </p>
                <p>
                    You may re-apply in 3 weeks if we&apos;ve given you a reason and our expectations once you&apos; addressed the concerns. If you need help,
                    feel free to reach out to us &mdash; we&apos;re interested in supporting the wider Genshin Impact community beyond just our own servers.
                </p>
            </Panel>
            <h2>Requirements</h2>
            <p>
                Not much is required of TCN servers. Observation is almost always a smooth process and few servers get rejected once their observation begins
                (most servers are rejected before that phase due to glaring issues with its setup or the people running it and occasionally because it is not
                even a valid candidate).
            </p>
            <p>
                Once you&apos;ve joined, we only expect you to maintain a civil working relationship with other servers in the network. You do not have to be
                friends with anyone as long as you remain civil.
            </p>
            <p>
                Our only technical requirements are to keep the updated list of TCN servers in a publicly visible channel and follow our <b>#network-events</b>{" "}
                channel, as cross-promotion is an important benefit our servers receive. Everything else we offer is completely optional and you do not have to
                add any Discord bot to your server.
            </p>
            <p>
                Otherwise, we don&apos; restrict how you should run your server or force you to follow a specific structure (in fact, there is no &quot;TCN
                structure/template&quot;, even if people wanted it). We only uphold common sense expectations such as keeping your environment safe and
                welcoming, and otherwise we seek to offer you resources and help in achieving your vision for your server and community.
            </p>
            <hr />
            <p>Ready to apply? Just fill out the application form!</p>
            <p>
                <a href="/apply">
                    <Button>Apply Here!</Button>
                </a>
            </p>
        </Prose>
    );
}
