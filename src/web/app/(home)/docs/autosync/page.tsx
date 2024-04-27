import { FaAnglesLeft } from "react-icons/fa6";
import { Button } from "../../../../components/ui/button";
import { Prose } from "../../../../components/ui/prose";

export default function DocsAutosync() {
    return (
        <Prose>
            <h1>Docs &mdash; Autosync</h1>
            <a href="/docs">
                <Button className="flex items-center gap-2">
                    <FaAnglesLeft></FaAnglesLeft> Return to Docs Home
                </Button>
            </a>
            <p>
                You can find the setup instructions{" "}
                <a href="/quickstart/requirements#autosync" className="link">
                    here
                </a>
                .
            </p>
            <p>
                Each time you update the posting location via <code>/autosync channel set</code> or <code>/autosync webhook set</code>, the bot will delete your
                previous embed (if one existts) and post a new one (unless you did not actually make a change).
            </p>
            <p>
                To manually trigger an update (e.g. if your bot&apos;s permissions were not configured correctly during an update), you can use{" "}
                <code>/autosync update</code>.
            </p>
            <p>
                If the autosync mode is set to <b>repost</b>, an update will cause a new embed to be posted and the old one to be deleted. This is suitable for
                channels dedicated to just the TCN embed. If the mode is set to <b>edit</b>, the existing embed will just be edited in-place (or a new one will
                be posted if the old one cannot be found). This is more suitable if you are using one channel for listing all of your partners.
            </p>
            <p>
                To stop using autosync, you can call <code>/autosync disable</code>.
            </p>
        </Prose>
    );
}
