import { FaAngleLeft, FaAnglesLeft } from "react-icons/fa6";
import { Button } from "../../../../components/ui/button";
import { Prose } from "../../../../components/ui/prose";
import UserMention from "../../../../components/ui/user-mention";

export default function QuickstartOtherBots() {
    return (
        <Prose>
            <h1>Quickstart &mdash; Other Bots</h1>
            <div className="flex items-center gap-4">
                <a href="/quickstart">
                    <Button className="flex items-center gap-2">
                        <FaAnglesLeft /> Return to Quickstart Home
                    </Button>
                </a>
                <a href="/quickstart/staff-link">
                    <Button className="flex items-center gap-2">
                        <FaAngleLeft /> Staff Link
                    </Button>
                </a>
            </div>
            <p>None of these bots are TCN-exclusive. Feel free to use them in your other servers as well!</p>
            <h2>Genshin Wizard</h2>
            <p>
                <UserMention id="782099719718699009" /> is an official partner of the TCN created by <UserMention id="188109365671100416" />. You can visit its
                website{" "}
                <a href="https://genshinwizard.com/" className="link" target="_blank">
                    here
                </a>
                .
            </p>
            <p>
                <b>Genshin Wizard</b> is a multi-purpose Genshin Impact bot with a comprehensive set of features allowing you to view your in-game stats, flex
                your builds, view build guides and hundreds of high-quality infographics, etc.
            </p>
            <p>
                As part of our partnership benefits, you get free access to its premium features. To enable this, contact their support team through their{" "}
                <a href="https://discord.gg/BTT5Zr7Dmp" className="link" target="_blank">
                    Discord server
                </a>{" "}
                through a ticket and mention that you are part of the TCN and would like help setting up.
            </p>
            <h2>Daedalus</h2>
            <p>
                <UserMention id="989173789482975262" /> is an official partner of the TCN created by <UserMention id="251082987360223233" />. You can visit its
                website{" "}
                <a href="https://daedalusbot.xyz" className="link" target="_blank">
                    here
                </a>
                .
            </p>
            <p>
                <b>Daedalus</b> is a modern, general-purpose bot containing a wide array of features for all of your server management needs. It features full
                slash-command support, buttons and dropdowns for a smooth experience, modals, high customizability, transparent permissions, etc.
            </p>
            <p>
                As part of our partnership benefits, you get free access to its custom client feature, allowing you to run your server&apos;s features through
                your own bot with full control over its name, avatar, banner, etc. To enable this, contact <UserMention id="251082987360223233" /> and they will
                give you instructions.
            </p>
        </Prose>
    );
}
