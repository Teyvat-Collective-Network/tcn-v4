import { FaChartLine, FaCheckToSlot, FaCircleInfo, FaCircleNodes, FaComments, FaEarthAmericas, FaHandshake, FaUserGroup } from "react-icons/fa6";
import { Panel } from "../../../components/ui/panel";
import { Prose } from "../../../components/ui/prose";

export default function About() {
    return (
        <Prose>
            <h1>About the Teyvat Collective Network</h1>
            <hr />
            <Panel>
                <h2 className="mt-4">What is the TCN?</h2>
                <p>
                    The Teyvat Collective Network, also known as the TCN, is a network of high-quality Genshin Impact Discord servers dedicated to fostering
                    Mains-style fan communities. We place an emphasis on collaborative community-building, servers offering help and resources to each other,
                    and maintaining healthy and safe communities for Genshin Impact fans to find a home in on Discord.
                </p>
            </Panel>
            <br />
            <Panel>
                <h2 className="mt-4">Organization</h2>
                <p>
                    The TCN does not enforce any particular structure on its member servers. TCN servers are not required to change their server setup, follow a
                    template, enforce particular rules, or give any permissions to TCN observers. Our only requirements are to display a list of TCN partner
                    servers, cross-post event promotions from partner servers, and maintain a healthy community that follows its rules.
                </p>
                <p>
                    The main component of the TCN is you &mdash; our community and our constituent servers. In addition, we have an official public server, the{" "}
                    <a href={process.env.HUB_INVITE} className="link" target="_blank">
                        TCN Hub
                    </a>
                    , which we use for official communications and where you can contact us and other server staff and ask questions or give feedback about the
                    TCN. We also have a private HQ server for internal communication and organization.
                </p>
            </Panel>
            <br />
            <Panel>
                <h2 className="mt-4">Benefits of Joining the TCN</h2>
                <h3 className="flex items-center gap-4">
                    <FaCircleInfo></FaCircleInfo> Information
                </h3>
                <p>
                    As a member server of the TCN, you get access to information on members, ongoing issues, as well as informative resources like server setup
                    and tools and on-demand help for the technical aspects and community and staff management.
                </p>
                <h3 className="flex items-center gap-4">
                    <FaHandshake></FaHandshake> Connections
                </h3>
                <p>
                    TCN servers have quick and easy access to communication with each other. In addition to being able to more quickly resolve any issues and
                    form strong relationships with many other prominent servers, you have the unique opportunity to more easily start collaborations for things
                    like events, which you can also promote through the TCN&apos;s event announcement feed.
                </p>
                <h3 className="flex items-center gap-4">
                    <FaChartLine></FaChartLine> Growth
                </h3>
                <p>
                    When you join the TCN, you automatically become a TCN partner of all TCN servers and will have your server listed on the partner list in all
                    of them. Additionally, you will be able to get tips on how to improve your server environment and grow a strong, healthy community.
                </p>
                <h3 className="flex items-center gap-4">
                    <FaCircleNodes></FaCircleNodes> Networking
                </h3>
                <p>
                    As a TCN server, besides direct connections with other server owners, you will also have access to networking with admins in HQ and with
                    other server admins and staff through their TCN representatives.
                </p>
                <h3 className="flex items-center gap-4">
                    <FaEarthAmericas></FaEarthAmericas> Global Chat
                </h3>
                <p>
                    You will have access to global channels, which are channels where messages are relayed to all connected servers. We have a public global
                    channel so your members can talk to members all across the TCN from the comfort of your server, as well as channels for staff. You will also
                    be able to use these channels for collaboration events if you want participating servers&apos; members to be able to talk to each other from
                    any server.
                </p>
            </Panel>
            <br />
            <Panel>
                <h2 className="mt-4">Our Core Tenets</h2>
                <h3 className="flex items-center gap-4">
                    <FaComments></FaComments> Transparency
                </h3>
                <p>
                    We prioritize two-way communication with our member servers. We are always open to feedback and will reach out for opportunities to improve
                    the network to work for our members, and not the other way around.
                </p>
                <h3 className="flex items-center gap-4">
                    <FaCheckToSlot></FaCheckToSlot> Democracy
                </h3>
                <p>
                    In addition to communicating major changes with our members clearly, we propose these changes and vote on major decisions on them, and the
                    observer team does not have any more of a say in matters than everyone else. Each server gets one vote in all important matters. We also
                    implement follow-up changes based on feedback.
                </p>
                <h3 className="flex items-center gap-4">
                    <FaUserGroup></FaUserGroup> Collaboration
                </h3>
                <p>
                    We don&apos;t expect everyone in the TCN to like everyone else, but even when discussions are heated we treat each other with civility and
                    get to the core of the issue and come to a resolution that can benefit us all as much as possible. Additionally, we learn from conflicts,
                    and every mistake or dispute is an opportunity to not just fix the root of the issue but improve other parts of the network.
                </p>
            </Panel>
        </Prose>
    );
}
