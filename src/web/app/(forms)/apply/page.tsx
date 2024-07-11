"use client";

import Image from "next/image";
import { useState } from "react";
import { FormLogin } from "../../../components/form-login";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Panel } from "../../../components/ui/panel";
import { Prose } from "../../../components/ui/prose";
import { Textarea } from "../../../components/ui/textarea";
import { getInvite, submitApplication } from "./actions";

export default function Apply() {
    const [state, setState] = useState<string>("root");

    const [invite, setInvite] = useState<string>("");
    const [experience, setExperience] = useState<string>("");
    const [goals, setGoals] = useState<string>("");
    const [history, setHistory] = useState<string>("");
    const [additional, setAdditional] = useState<string>("");

    const [inviteData, setInviteData] = useState<{ id: string; name: string; image: string | null; memberCount: number; serverCreatedAt: number }>({
        id: "",
        name: "",
        image: "",
        memberCount: 0,
        serverCreatedAt: 0,
    });
    const [submitting, setSubmitting] = useState<boolean>(false);

    async function confirmInvite() {
        const result = await getInvite(invite);
        if (typeof result === "string") return alert(result);

        setInviteData(result);
        setState("has-server");
    }

    async function submit() {
        try {
            setSubmitting(true);

            const result = await submitApplication(invite, experience, goals, history, additional);
            if (result) return alert(result);

            setState("done");
        } finally {
            setSubmitting(false);
        }
    }

    if (state === "done")
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
            <Prose>
                <h1>TCN Application Form</h1>
                <Panel>
                    <p>
                        Welcome to the TCN application form! If you haven&apos;t yet, be sure to read our{" "}
                        <a href="/join" className="link">
                            info page
                        </a>{" "}
                        on the process for joining the TCN and what to expect. If you have any questions, please reach out to us! See our{" "}
                        <a href="/contact" className="link">
                            contact info
                        </a>{" "}
                        page for more details.
                    </p>
                    <p>Please make sure your DMs are open so we can reach out to you to respond to your application.</p>
                </Panel>
                <br />
                <Panel>
                    <p>Applying to the TCN comes with a few things that you must agree to:</p>
                    <ul>
                        <li>
                            You will need to give view access to <b>all of your server&apos;s channels</b> as well as the <b>audit logs</b> during the
                            observation period.
                        </li>
                        <li>
                            If you join the TCN, you will need to keep the partner list publicly visible and up-to-date in your server (
                            <a href="/quickstart/requirements" className="link" target="_blank">
                                learn more
                            </a>
                            ).
                        </li>
                        <li>If you join the TCN, you will need to follow our event cross-promotion announcement channel in a publicly visible channel.</li>
                    </ul>
                    <p>
                        Also, if you aren&apos;t the server owner, please make sure you have permission from the server owner to apply to the TCN and that they
                        understand these terms.
                    </p>
                    {state === "root" ? <Button onClick={() => setState("consented")}>I Agree</Button> : null}
                </Panel>
                {state === "consented" ? (
                    <>
                        <p>
                            Let&apos;s begin by getting an invite to your server. Please make sure it&apos;s permanent (i.e. will not expire) and not your
                            server&apos;s vanity link.
                        </p>
                        <Input value={invite} onChange={({ currentTarget: { value } }) => setInvite(value)} placeholder="https://discord.gg/..." />
                        <br />
                        <Button onClick={confirmInvite}>Next</Button>
                    </>
                ) : null}
                {state === "has-server" ? (
                    <>
                        <div className="flex items-center gap-2">
                            You are applying for
                            {inviteData.image ? <Image src={inviteData.image} alt="Could Not Load Icon" width={32} height={32} /> : null}
                            <span>
                                <b>{inviteData.name}</b>.
                            </span>
                            <Button onClick={() => setState("consented")}>Change Server</Button>
                        </div>
                        {inviteData.memberCount >= 300 ? null : (
                            <>
                                <Panel highlight>
                                    <h3 className="mt-0">Warning!</h3>
                                    <p>
                                        Your server has fewer than 300 members. We <b>strongly encourage</b> you to wait until your server has 300 members
                                        before applying, as we expect servers to be established enough for us to review. If you believe your server is
                                        established enough and ready for our assessment, you may apply anyway.
                                    </p>
                                </Panel>
                                <br />
                            </>
                        )}
                        <Panel>
                            <h3 className="mt-4">
                                Do you have prior experience running a Discord server or similar communities in a position of management or moderation (e.g.
                                forums, guilds, clans, etc.)?
                            </h3>
                            <p>
                                You do not have to have been the owner of the server / forum / etc.; any position of management or moderation is of interest.
                                Feel free to talk about the experience of multiple people who are in charge of the server.
                            </p>
                            <Textarea
                                value={experience}
                                onChange={({ currentTarget: { value } }) => setExperience(value)}
                                rows={4}
                                className={experience.length > 1024 ? "border-2 border-destructive" : ""}
                            />
                            <p className="text-xs">{experience.length} / 1024</p>
                            <hr className="my-8" />
                            <h3>What are your short- and long-term goals for your server/community?</h3>
                            <Textarea
                                placeholder="Required"
                                value={goals}
                                onChange={({ currentTarget: { value } }) => setGoals(value)}
                                rows={4}
                                className={goals.length > 1024 ? "border-2 border-destructive" : ""}
                            />
                            <p className="text-xs">{goals.length} / 1024</p>
                            <hr className="my-8" />
                            <h3>Please give us a rough outline of your server&apos;s history.</h3>
                            <p>
                                For example, if your server has ever rebranded, please list its former identities. Additionally, what inspired/motivated you to
                                start the server, and what notable events or changes have occurred or what troubles have you had to overcome?
                            </p>
                            <Textarea
                                placeholder="Required"
                                value={history}
                                onChange={({ currentTarget: { value } }) => setHistory(value)}
                                rows={4}
                                className={history.length > 1024 ? "border-2 border-destructive" : ""}
                            />
                            <p className="text-xs">{history.length} / 1024</p>
                        </Panel>
                        <br />
                        <Panel>
                            <h3 className="mt-4">Any additional questions or comments you&apos;d like to include?</h3>
                            <Textarea
                                value={additional}
                                onChange={({ currentTarget: { value } }) => setAdditional(value)}
                                rows={4}
                                className={additional.length > 1024 ? "border-2 border-destructive" : ""}
                            />
                            <p className="text-xs">{additional.length} / 1024</p>
                        </Panel>
                        <br />
                        <Button disabled={submitting} onClick={submit}>
                            Submit!
                        </Button>
                    </>
                ) : null}
            </Prose>
        </FormLogin>
    );
}
