import { FaAngleLeft, FaAngleRight, FaAnglesLeft } from "react-icons/fa6";
import { Button } from "../../../../../components/ui/button";
import { Panel } from "../../../../../components/ui/panel";
import { Prose } from "../../../../../components/ui/prose";

export default function OnboardingGuideExpectations() {
    return (
        <Prose>
            <h1>Observer Onboarding &mdash; Expectations</h1>
            <div className="flex items-center gap-4">
                <a href="/admin/onboarding">
                    <Button className="flex items-center gap-2">
                        <FaAnglesLeft /> Return to Onboarding Home
                    </Button>
                </a>
                <a href="/admin/onboarding/critical">
                    <Button className="flex items-center gap-2">
                        <FaAngleLeft /> Critical Information
                    </Button>
                </a>
            </div>
            <p>
                This section is not a complete list of expectations nor is it objective. This is simply to give you a rough idea of what is expected of you, but
                your intuition and individual judgement is a crucial part of your success as an observer.
            </p>
            <Panel>
                <h2 className="mt-4">Be a role model</h2>
                <p>
                    As an observer, the council should be able to look up to you as an example. Everything that is expected of council members is expected of
                    you even more. This includes — but is not limited to — the following.
                </p>
                <h3>Be respectful</h3>
                <p>
                    This does not mean you are not allowed to raise criticism or that you have to put on a nice facade. You are expected to approach issues with
                    civility and the appropriate amount of compassion, but ensuring that what&apos;s necessary is done is still integral.
                </p>
                <h3>Be punctual</h3>
                <p>
                    While things aren&apos;t very time-sensitive, we have an expectation as a team to address things in a timely fashion. For example, banshares
                    should be published within a reasonable time frame, events should be crossposted without excessive delay, and the weekly summary should be
                    done on time.
                </p>
                <h3>Be present.</h3>
                <p>
                    It is an expectation of all designated voters to vote, and you should be present to vote (if you are a voter) and for discussions regarding
                    network matters.
                </p>
            </Panel>
            <br />
            <Panel>
                <h2 className="mt-4">Be a leader</h2>
                <p>
                    More than just a background administrator, you are also looked upon to lead discussions and drive changes. If you see points being forgotten
                    or discussions stagnating, look for opportunities to ressurect important conversations and bring points back into the discussion and ensure
                    all perspectives are considered.
                </p>
            </Panel>
            <br />
            <Panel>
                <h2 className="mt-4">Empower others</h2>
                <p>
                    It can be intimidating to raise concerns or bring up points to the council during discussions, especially when things get heated. As an
                    observer, your authority also carries weight. Look for opportunities to use it to ensure everyone has a voice and advocate for compassion
                    and consideration of different points of view.
                </p>
            </Panel>
            <br />
            <Panel>
                <h2 className="mt-4">Be a team player</h2>
                <p>
                    The success of the TCN lies in its democracy, transparency, and open communication. By extension, the success of the observer team in charge
                    of its operation lies in its communication and teamwork. Make sure that you&apos;re on the same page as the team. Your individual judgement
                    is still important, but for things like reaching out to parties, responding to official inquiries, etc. make sure you discuss with the team
                    first. Additionally, make sure you follow up on things in accordance with the team&apos;s agreements.
                </p>
            </Panel>
            <br />
            <Panel>
                <h2 className="mt-4">Recognize the weight of your title</h2>
                <p>
                    As an observer, you are entrusted with the reputation of the network, and your actions carry more weight due to your role. You can still
                    have personal conversations and friendly relations, but acknowledge and act in consideration of the fact that your words may be considered
                    more official, even if you don&apos;t mean it that way, and even if you don&apos;t think it makes sense.
                </p>
                <p>
                    You should not be paranoid about every word you say, and particularly within HQ people are less likely to misinterpret your words as
                    official when you are just giving your opinion.
                </p>
                <p>
                    However, when reaching out to or talking to outside parties concerning the TCN or the Genshin Impact Discord community as a whole, make sure
                    you are clear if you are not speaking in official capacity, and follow the standards of teamwork and communication if you are.
                </p>
                <p>
                    Consider: &quot;Would the council approve of what I am saying?&quot; If it is clear to you that they would, it&apos;s fine to speak in
                    official capacity. Additionally, relaying things that are factually true such as things in our constitution or info pages is completely
                    fine.
                </p>
            </Panel>
            <br />
            <a href="/admin/onboarding/directory">
                <Button className="flex items-center gap-2">
                    Directory <FaAngleRight />
                </Button>
            </a>
        </Prose>
    );
}
