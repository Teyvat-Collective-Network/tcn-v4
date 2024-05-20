"use client";

import { useState } from "react";
import { FaHashtag, FaHouse, FaRepeat } from "react-icons/fa6";
import { FormLogin } from "../../../components/form-login";
import { Button } from "../../../components/ui/button";
import { ComboSelector } from "../../../components/ui/combo-selector";
import { Dialog, DialogContent, DialogTrigger } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import Mention from "../../../components/ui/mention";
import { Panel } from "../../../components/ui/panel";
import { Prose } from "../../../components/ui/prose";
import { Switch } from "../../../components/ui/switch";
import { Textarea } from "../../../components/ui/textarea";
import UserMention from "../../../components/ui/user-mention";
import { submitReport } from "./actions";

export default function ReportFormClient({ guilds }: { guilds: { id: string; name: string }[] }) {
    const [ids, setIds] = useState<string>("");
    const [reason, setReason] = useState<string>("");
    const [evidence, setEvidence] = useState<string>("");
    const [server, setServer] = useState<string | null>(null);
    const [category, setCategory] = useState<string | null>(null);
    const [urgent, setUrgent] = useState<boolean>(false);

    const [open, setOpen] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [done, setDone] = useState<boolean>(false);

    if (done)
        return (
            <Prose>
                <h2>Thank you for submitting a report.</h2>
                <p>
                    We will review it and you should see it in{" "}
                    <Mention>
                        <FaHashtag /> network-user-reports
                    </Mention>{" "}
                    in the TCN Hub shortly. We will reach out to you if we believe the report does not meet our standards.
                </p>
                <div className="flex items-center gap-4">
                    <a href="/">
                        <Button className="flex items-center gap-2">
                            <FaHouse /> Home
                        </Button>
                    </a>
                    <Button
                        className="flex items-center gap-2"
                        onClick={() => {
                            setIds("");
                            setReason("");
                            setEvidence("");
                            setServer(null);
                            setCategory(null);
                            setUrgent(false);

                            setDone(false);
                        }}
                    >
                        <FaRepeat /> Submit Another
                    </Button>
                </div>
            </Prose>
        );

    return (
        <FormLogin>
            <Prose>
                <h1>Submit Network User Report</h1>
                <p>
                    <a href="/docs/network-user-reports" className="link" target="_blank">
                        Documentation &amp; Policy
                    </a>
                </p>
                <Panel>
                    <h2 className="mt-4">ID(s) of the offender(s)</h2>
                    <Input placeholder="Space-separated list of IDs" value={ids} onChange={({ currentTarget: { value } }) => setIds(value)} />
                    <br />
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={!ids.trim() || ids.trim().split(/\s+/).length > 20}>Check IDs (20- users)</Button>
                        </DialogTrigger>
                        <DialogContent>
                            {open
                                ? ((idList) => {
                                      for (const id of idList)
                                          if (!id.match(/^[1-9][0-9]{16,19}$/))
                                              return (
                                                  <p>
                                                      At least one ID is invalid, e.g. <code>{id}</code>.
                                                  </p>
                                              );

                                      return (
                                          <ul>
                                              {idList.map((id) => (
                                                  <li key={id}>
                                                      <code>{id}</code> &mdash; <UserMention id={id} />
                                                  </li>
                                              ))}
                                          </ul>
                                      );
                                  })([...new Set(ids.trim().split(/\s+/))])
                                : null}
                        </DialogContent>
                    </Dialog>
                    <hr className="my-8" />
                    <h2>Reason</h2>
                    <p>
                        The reason should be suitable for an audit log reason. Keep it concise but adequately informative. Formality is expected and reports
                        with non-serious reasons will not be accepted.
                    </p>
                    <Textarea
                        placeholder="Required &mdash; maximum 480 characters"
                        value={reason}
                        onChange={({ currentTarget: { value } }) => setReason(value)}
                        maxLength={480}
                        rows={4}
                    />
                    <hr className="my-8" />
                    <h2>Evidence &amp; Context</h2>
                    <p>
                        Upload images to a hosting service e.g.{" "}
                        <a href="https://imgur.com" className="link" target="_blank" tabIndex={-1}>
                            Imgur
                        </a>
                        . Discord media links are not allowed as they will expire. You may create and link a document if you need more than the available space.
                        Provide sufficient evidence to verify your reason and for other staff to make an informed decision.
                    </p>
                    <Textarea
                        placeholder="Required &mdash; maximum 1000 characters"
                        value={evidence}
                        onChange={({ currentTarget: { value } }) => setEvidence(value)}
                        maxLength={1000}
                        rows={4}
                    />
                    <hr className="my-8" />
                    <h2>Server</h2>
                    <p>
                        Identify the server from which you are submitting this report. This is just for auditing/contact, so if you are not in the server where
                        the incident happened or it spans multiple servers, just pick whichever one you staff most actively in.
                    </p>
                    <ComboSelector values={guilds.map((guild) => ({ label: guild.name, value: guild.id }))} value={server} setValue={setServer} />
                    <hr className="my-8" />
                    <h2>Category</h2>
                    <p>
                        Refer to the{" "}
                        <a href="/docs/network-user-reports#categories" className="link" target="_blank" tabIndex={-1}>
                            info page
                        </a>{" "}
                        for more information.
                    </p>
                    <ComboSelector
                        values={[
                            { label: "Banshare", value: "banshare" },
                            { label: "Advisory Report", value: "advisory" },
                            { label: "Hacked Account Report", value: "hacked" },
                        ]}
                        value={category}
                        setValue={setCategory}
                    />
                    <hr className="my-8" />
                    <h2>Urgency</h2>
                    <p>Check the box below to ping all observers to review this report urgently.</p>
                    <div className="flex items-center gap-4">
                        <Switch checked={urgent} onCheckedChange={setUrgent} /> This report is urgent.
                    </div>
                </Panel>
                <br />
                <Button
                    disabled={submitting}
                    onClick={async () => {
                        setSubmitting(true);

                        try {
                            if (!ids.trim()) return alert("Please enter the ID(s) of the offender(s).");

                            if (!ids.match(/^\s*[1-9][0-9]{16,19}(\s+[1-9][0-9]{16,19})*\s*$/))
                                return alert('ID list format is invalid. Click "Check IDs" for more information.');

                            if (!reason.trim()) return alert("Please enter the reason for this report.");
                            if (!evidence.trim()) return alert("Please enter the evidence for this report.");
                            if (!server) return alert("Please select a server from which to submit this report.");
                            if (!category) return alert("Please select the severity of this report.");

                            const error = await submitReport(ids, reason, evidence, server, category, urgent);
                            if (error) return alert(error);

                            setDone(true);
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    Submit
                </Button>
            </Prose>
        </FormLogin>
    );
}
