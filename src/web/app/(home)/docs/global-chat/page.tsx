import { FaAnglesLeft } from "react-icons/fa6";
import { Button } from "../../../../components/ui/button";
import { Prose } from "../../../../components/ui/prose";

export default function DocsGlobalChatt() {
    return (
        <Prose>
            <h1>Docs &mdash; Global Chat</h1>
            <a href="/docs">
                <Button className="flex items-center gap-2">
                    <FaAnglesLeft></FaAnglesLeft> Return to Docs Home
                </Button>
            </a>
        </Prose>
    );
}
