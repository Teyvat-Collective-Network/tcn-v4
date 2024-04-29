"use client";

import { useState } from "react";
import { FormLogin } from "../../../components/form-login";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Panel } from "../../../components/ui/panel";
import { Prose } from "../../../components/ui/prose";
import { Textarea } from "../../../components/ui/textarea";
import { submitApplication } from "./actions";

export default function Apply() {
    const [invite, setInvite] = useState<string>("");
    const [experience, setExperience] = useState<string>("");
    const [goals, setGoals] = useState<string>("");
    const [history, setHistory] = useState<string>("");
    const [additional, setAdditional] = useState<string>("");

    const [done, setDone] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);

    if (done)
        return (
            <Prose>
                <h2>Thank you for applying!</h2>
                <p>Please give us a few days to review your application and get in touch with you. Make sure we are able to reach you, ideally through DMs.</p>
                <a href="/">
                    <Button>Home</Button>
                </a>
            </Prose>
        );

    return (
        <FormLogin>
            <Panel className="prose">
                <h3>By submitting this form, you confirm all of the following:</h3>
                <ul>
                    <li>I am either the owner of this server or have permission from the server owner to apply to the TCN.</li>
                    <li>
                        I agree to give my server&apos;s observer view access to <u>all channels and the audit logs</u> for the observation period.
                    </li>
                    <li>
                        I agree to display the TCN partner list publicly and keep it up-to-date (
                        <a href="/quickstart/requirements" className="link">
                            learn more
                        </a>
                        ).
                    </li>
                    <li>
                        I agree to follow <b>#network-events</b> publicly to cross-promote TCN server events and post crucial TCN announcements.
                    </li>
                </ul>
            </Panel>
            <br />
            <Panel className="prose">
                <h3>Enter a permanent, non-vanity invite pointing to your server.</h3>
                <Input
                    placeholder="https://discord.gg/..."
                    required
                    maxLength={64}
                    value={invite}
                    onChange={({ currentTarget: { value } }) => setInvite(value)}
                ></Input>
            </Panel>
            <br />
            <Panel className="prose">
                <h3>
                    Do you have prior experience running a Discord server or similar communities in a position of management or moderation (e.g. forums, guilds,
                    clans, etc.)?
                </h3>
                <p>
                    You do not have to have been the owner of the server / forum / etc.; any position of management or moderation is of interest. Feel free to
                    talk about the experience of multiple people who are in charge of the server.
                </p>
                <Textarea
                    placeholder="Maximum 1024 characters"
                    rows={4}
                    maxLength={1024}
                    value={experience}
                    onChange={({ currentTarget: { value } }) => setExperience(value)}
                ></Textarea>
                <hr className="my-8" />
                <h3>What are your short- and long-term goals for your server/community?</h3>
                <Textarea
                    placeholder="Required &mdash; maximum 1024 characters"
                    rows={4}
                    required
                    maxLength={1024}
                    value={goals}
                    onChange={({ currentTarget: { value } }) => setGoals(value)}
                ></Textarea>
                <hr className="my-8" />
                <h3>Please give us a rough outline of your server&apos;s history.</h3>
                <p>
                    For example, if your server has ever rebranded, please list its former identities. Additionally, what inspired/motivated you to start the
                    server, and what notable events or changes have occurred or what troubles have you had to overcome?
                </p>
                <Textarea
                    placeholder="Required &mdash; maximum 1024 characters"
                    rows={4}
                    required
                    maxLength={1024}
                    value={history}
                    onChange={({ currentTarget: { value } }) => setHistory(value)}
                ></Textarea>
            </Panel>
            <br />
            <Panel className="prose">
                <h3>Any additional questions or comments you&apos;d like to include?</h3>
                <Textarea
                    placeholder="Maximum 1024 characters"
                    rows={4}
                    maxLength={1024}
                    value={additional}
                    onChange={({ currentTarget: { value } }) => setAdditional(value)}
                ></Textarea>
            </Panel>
            <br />
            <p className="prose">
                Make sure you check our{" "}
                <a href="/contact" className="link">
                    list of observers
                </a>{" "}
                before giving permissions to whoever contacts you!
            </p>
            <br />
            <Button
                disabled={submitting}
                onClick={async () => {
                    setSubmitting(true);

                    try {
                        const [result, valid] = await submitApplication({ invite, experience, goals, history, additional });
                        if (!valid) return alert(result);

                        setDone(true);
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                Submit!
            </Button>
        </FormLogin>
    );
}
