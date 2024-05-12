import { FaAngleLeft, FaAngleRight, FaAnglesLeft } from "react-icons/fa6";
import { Button } from "../../../../components/ui/button";
import { Prose } from "../../../../components/ui/prose";

export default function QuickstartStaffLink() {
    return (
        <Prose>
            <h1>Quickstart &mdash; Staff Link</h1>
            <div className="flex items-center gap-4">
                <a href="/quickstart">
                    <Button className="flex items-center gap-2">
                        <FaAnglesLeft /> Return to Quickstart Home
                    </Button>
                </a>
                <a href="/quickstart/global-chat">
                    <Button className="flex items-center gap-2">
                        <FaAngleLeft /> Global Chat
                    </Button>
                </a>
            </div>
            <p>
                You can register your staff in the API (which gives them the role in the TCN Hub and allows them to publish banshares) using{" "}
                <code>/staff add</code> on the TCN bot. You can link roles to automatically add and remove staff when their roles change in your server.
            </p>
            <p>
                To set this up, you will need to add the bot to your server using{" "}
                <a
                    href={`https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=1512097303623&scope=applications.commands%20bot`}
                    className="link"
                    target="blank"
                >
                    this link
                </a>
                .
            </p>
            <ul>
                <li>
                    To add/remove a staff member manually, use <code>/staff add</code> and <code>/staff remove</code>. Note that either of these will override
                    the automatic link &mdash; <code>/staff reset</code> to clear a user&apos;s override and allow them to be automatically synchronized.
                </li>
                <li>
                    To add/remove a role from the staff list, use <code>/staff roles add</code> and <code>/staff roles remove</code>. A user that has any of
                    these roles who is not explicitly set as non-staff will become staff, and a user that is not explicitly set as staff will be removed if they
                    ever lose all of these roles.
                </li>
                <li>
                    Use <code>/staff list</code> to list all staff including overrides and roles.
                </li>
            </ul>
            <a href="/quickstart/other-bots">
                <Button className="flex items-center gap-2">
                    Other Bots <FaAngleRight />
                </Button>
            </a>
        </Prose>
    );
}
