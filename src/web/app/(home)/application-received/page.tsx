"use server";

import { Button } from "../../../components/ui/button";
import { Prose } from "../../../components/ui/prose";

export default async function ApplicationReceived() {
    return (
        <Prose>
            <h2>Thank you for applying!</h2>
            <p>
                Please give us a few days to review your application and get in touch with you. Make sure we are able to reach you &mdash; we recommend joining
                the{" "}
                <a href={process.env.HUB_INVITE} className="link">
                    TCN Hub
                </a>{" "}
                and turning on your DMs, at least for that server.
            </p>
            <a href="/">
                <Button>Home</Button>
            </a>
        </Prose>
    );
}
