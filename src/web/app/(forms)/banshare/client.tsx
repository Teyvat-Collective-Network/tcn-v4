"use client";

import { useState } from "react";
import { FormLogin } from "../../../components/form-login";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Panel } from "../../../components/ui/panel";
import { Prose } from "../../../components/ui/prose";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Textarea } from "../../../components/ui/textarea";
import UserMention from "../../../components/ui/user-mention";
import { useUserContext } from "../../../context/user";
import { submitBanshare } from "./actions";

export default function BanshareClient({ servers }: { servers: { id: string; name: string }[] }) {
    const user = useUserContext();

    const [ids, setIds] = useState<string>("");
    const [reason, setReason] = useState<string>("");
    const [evidence, setEvidence] = useState<string>("");
    const [server, setServer] = useState<string>("");
    const [severity, setSeverity] = useState<string>("");
    const [urgent, setUrgent] = useState<boolean>(false);

    const [previewing, setPreviewing] = useState<boolean>(false);

    const [submitting, setSubmitting] = useState<boolean>(false);
    const [done, setDone] = useState<boolean>(false);

    async function submit(validate: boolean) {
        setSubmitting(true);

        try {
            const [result, valid] = await submitBanshare({ ids, reason, evidence, server, severity, urgent, validate });
            if (!valid) return alert(result);

            setIds("");
            setReason("");
            setEvidence("");
            setServer("");
            setSeverity("");
            setUrgent(false);

            setDone(true);
        } finally {
            setSubmitting(false);
        }
    }

    if (!user) return;

    if (done)
        return (
            <Prose>
                <h2>Thank you for submitting a banshare!</h2>
                <p>We will review it shortly.</p>
                <div className="flex items-center gap-4">
                    <Button onClick={() => setDone(false)}>Submit Another</Button>
                    <a href="/">
                        <Button>Home</Button>
                    </a>
                </div>
            </Prose>
        );

    return (
        <FormLogin>
            <p className="prose">
                First time submitting a banshare? Make sure you read the{" "}
                <a href="/docs/banshares" className="link" target="_blank">
                    submission guide
                </a>{" "}
                first.
            </p>
            <br />
            <Panel className="prose">
                <h3>ID(s) of the offender(s)</h3>
                <Input placeholder="Space-separated list of IDs" value={ids} onChange={({ currentTarget: { value } }) => setIds(value)}></Input>
                <br />
                <Button
                    onClick={() => {
                        if (!ids.match(/^\s*\d+(\s+\d+)*\s*$/))
                            return alert("Your ID list looks invalid. It should consist of space-separated IDs (where each ID is a string of digits)");

                        if (
                            ids
                                .trim()
                                .split(/\s+/)
                                .some((x) => !x.match(/^[1-9][0-9]{16,19}$/))
                        )
                            return alert("One or more of your IDs looks invalid. Each ID should be a string of 17-20 digits starting with a non-zero digit.");

                        setPreviewing(true);
                    }}
                    disabled={!ids.trim()}
                >
                    Check IDs
                </Button>
                <Dialog modal={true} open={previewing} onOpenChange={setPreviewing}>
                    <DialogContent>
                        <ScrollArea className="max-h-[75vh]">
                            <div className="prose h-[max-content]">
                                {previewing ? (
                                    <ul>
                                        {ids
                                            .trim()
                                            .split(/\s+/)
                                            .map((id) => (
                                                <li key={id}>
                                                    <code>{id}</code> &mdash; <UserMention id={id}></UserMention>
                                                </li>
                                            ))}
                                    </ul>
                                ) : null}
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
                <hr className="my-8" />
                <h3>Reason</h3>
                <p>
                    If you need more than 498 characters, you should probably be putting it into the evidence field instead. Make the reason something suitable
                    for an audit log reason for the ban and include context in the next field.
                </p>
                <p>
                    Please keep this as concise as possible and deliver the minimum necessary information here. A reasonable amount of formality is expected and
                    banshares with jokes or non-serious reasons may be denied.
                </p>
                <Textarea
                    placeholder="Required &mdash; maximum 498 characters"
                    value={reason}
                    onChange={({ currentTarget: { value } }) => setReason(value)}
                    maxLength={498}
                    rows={4}
                ></Textarea>
                <hr className="my-8" />
                <h3>Evidence</h3>
                <p>
                    Please upload images to{" "}
                    <a href="https://imgur.com" className="link" target="_blank">
                        Imgur
                    </a>{" "}
                    (or your image hosting platform of choice). Discord media links are <b>not allowed</b> because they will expire when statically posted
                    elsewhere.
                </p>
                <p>
                    If you need more than 1000 characters, please create a document and link it here. Include some basic information in the evidence so people
                    can see roughly what your document contains.
                </p>
                <p>Provide sufficient evidence to verify your reason and for other staff to make an informed decision.</p>
                <Textarea
                    placeholder="Required &mdash; maximum 1000 characters"
                    value={evidence}
                    onChange={({ currentTarget: { value } }) => setEvidence(value)}
                    maxLength={1000}
                    rows={4}
                ></Textarea>
            </Panel>
            <br />
            <Panel className="prose">
                <h3>Server</h3>
                <p>Identify the server from which you are submitting this banshare.</p>
                <Select value={server} onValueChange={setServer}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a server"></SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {servers.map(({ id, name }) => (
                                <SelectItem key={id} value={id}>
                                    {name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Panel>
            <br />
            <Panel className="prose">
                <h3>Severity</h3>
                <p>
                    The severity is used to determine autobanning. <b>P0</b> indicates the greatest threat. Refer to the{" "}
                    <a href="/docs/banshares#severity" className="link" target="_blank">
                        info page
                    </a>{" "}
                    for more information.
                </p>
                <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a severity"></SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="P0">P0 (Critical)</SelectItem>
                            <SelectItem value="P1">P1 (Medium)</SelectItem>
                            <SelectItem value="P2">P2 (Low)</SelectItem>
                            <SelectItem value="DM">DM Scam</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Panel>
            <br />
            <Panel className="prose">
                <h3>Urgency</h3>
                <p>Check the box below to ping all observers to review this banshare urgently.</p>
                <div className="flex items-center gap-4">
                    <Switch checked={urgent} onCheckedChange={setUrgent}></Switch>
                    <b>This banshare is urgent.</b>
                </div>
            </Panel>
            <br />
            <div className="flex items-center gap-4">
                <Button disabled={submitting} onClick={() => submit(true)}>
                    Submit
                </Button>
                <Button variant="ghost" disabled={submitting} onClick={() => submit(false)}>
                    Submit Without Validation
                </Button>
            </div>
            <br />
            <p className="prose">
                <b>Note:</b> Validation will check that your user IDs are valid. Skipping it is recommended if you are bansharing a lot of users at once (around
                20 or more), which will only scan your IDs to ensure they appear valid.
            </p>
        </FormLogin>
    );
}
