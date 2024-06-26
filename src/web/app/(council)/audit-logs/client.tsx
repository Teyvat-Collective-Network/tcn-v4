"use client";

import { useState } from "react";
import { FaPencil, FaServer, FaXmark } from "react-icons/fa6";
import AutoPaginate from "../../../components/ui/autopaginate";
import { Button } from "../../../components/ui/button";
import { ComboSelector } from "../../../components/ui/combo-selector";
import { Input } from "../../../components/ui/input";
import Mention from "../../../components/ui/mention";
import { Panel } from "../../../components/ui/panel";
import TimeMentionFull from "../../../components/ui/time-mention-full";
import UserMention from "../../../components/ui/user-mention";
import { useUserContext } from "../../../context/user";
import { getAuditLogs } from "./actions";

const types: { label: string; value: string }[] = [
    { label: "Add Server", value: "guilds/create" },
    { label: "Remove Server", value: "guilds/delete" },
    { label: "Update Owner", value: "guilds/update/owner" },
    { label: "Update Advisor", value: "guilds/update/advisor" },
    { label: "Swap Owner and Advisor", value: "guilds/update/swap-representatives" },
    { label: "Update Vote Delegation", value: "guilds/update/delegated" },
    { label: "Update Server Invite", value: "guilds/update/invite" },
    { label: "Update Server Mascot", value: "guilds/update/mascot" },
    { label: "Rename Server", value: "guilds/update/name" },
    { label: "Initiate Application Vote", value: "applications/vote" },
    { label: "Rename Application", value: "applications/rename" },
    { label: "Nuke Application", value: "applications/nuke" },
    { label: "Reset Poll Deadline", value: "polls/reset-deadline" },
    { label: "Delete Poll", value: "polls/delete" },
    { label: "Lock Network User Report", value: "reports/lock" },
    { label: "Unlock Network User Report", value: "reports/unlock" },
    { label: "Reject Network User Report", value: "reports/reject" },
    { label: "Restore Network User Report", value: "reports/restore" },
    { label: "Publish Network User Report", value: "reports/publish" },
    { label: "Rescind Network User Report", value: "reports/rescind" },
    { label: "Add Pre-Approve Option", value: "polls/update/add-preapprove" },
    { label: "Remove Pre-Approve Option", value: "polls/update/remove-preapprove" },
    { label: "Promote Observer", value: "users/promote" },
    { label: "Demote Observer", value: "users/demote" },
    { label: "Refresh Term", value: "users/refresh-term" },
    { label: "Change Global Nickname", value: "users/update/global-nickname" },
    { label: "Add Global Filter Term", value: "global/filter/add-term" },
    { label: "Create Global Filter", value: "global/filter/create" },
    { label: "Delete Global Filter Term", value: "global/filter/delete-term" },
    { label: "Delete Global Filter", value: "global/filter/delete" },
    { label: "Edit Global Filter Term Mode", value: "global/filter/edit-term-regex" },
    { label: "Edit Global Filter Term Match", value: "global/filter/edit-term-term" },
    { label: "Rename Global Filter", value: "global/filter/rename" },
    { label: "Create Global Channel", value: "global/channels/create" },
    { label: "Delete Global Channel", value: "global/channels/delete" },
    { label: "Set Global Channel Name", value: "global/channels/set-name" },
    { label: "Set Global Channel Visibility", value: "global/channels/set-visible" },
    { label: "Set Global Channel Password", value: "global/channels/set-password" },
    { label: "Connect Global Channel", value: "global/connect" },
    { label: "Disconnect Global Channel", value: "global/disconnect" },
    { label: "Global Panic Activated", value: "global/panic" },
    { label: "Global Panic Ended", value: "global/end-panic" },
    { label: "Add Global Mod", value: "global/mods/add" },
    { label: "Remove Global Mod", value: "global/mods/remove" },
    { label: "Set Global Channel Filters", value: "global/set-filters" },
];
const typeNames = Object.fromEntries(types.map((x) => [x.value, x.label]));

export default function AuditLogsClient({
    guilds,
    initial,
}: {
    guilds: { id: string; name: string }[];
    initial: { pages: number; entries: { time: number; actor: string; type: string; guild: string | null; data?: any }[] };
}) {
    const user = useUserContext();

    const [{ pages, entries }, setData] = useState(initial);

    const [actor, setActor] = useState<string | null>(null);
    const [type, setType] = useState<string | null>(null);
    const [guild, setGuild] = useState<string | null>(null);
    const [target, setTarget] = useState<string | null>(null);

    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(25);

    const guildNames = Object.fromEntries(guilds.map((x) => [x.id, x.name]));

    const guildRef = (id: string) =>
        guildNames[id] ? (
            <span>
                <Mention>
                    <FaServer /> {guildNames[id]}
                </Mention>{" "}
                (<code>{id}</code>)
            </span>
        ) : (
            <code>Guild: {id}</code>
        );

    return (
        <>
            <div className="grid grid-cols-[max-content_1fr] items-center gap-4">
                <b>Actor:</b>
                <div className="flex items-center gap-4">
                    {actor === null ? (
                        <span className="opacity-50">(all)</span>
                    ) : actor === "system" ? (
                        <Mention>
                            <FaServer /> System
                        </Mention>
                    ) : (
                        <UserMention id={actor} />
                    )}
                    <Button
                        variant="secondary"
                        onClick={() => {
                            const id = prompt("Enter user ID to filter by, or leave empty to show all entries")?.trim();
                            if (id === undefined) return;

                            if (id === "") return setActor(null);
                            if (!id.match(/^[1-9][0-9]{16,19}$/)) return alert("Invalid user ID.");

                            setActor(id);
                        }}
                    >
                        <FaPencil />
                    </Button>
                    <Button variant="secondary" onClick={() => setActor("system")}>
                        System
                    </Button>
                    <Button variant="secondary" onClick={() => setActor(null)}>
                        <FaXmark />
                    </Button>
                </div>
                <b>Action Type:</b>
                <div className="flex items-center gap-4">
                    <ComboSelector values={types} value={type} setValue={setType} />
                    <Button variant="secondary" onClick={() => setType(null)}>
                        <FaXmark />
                    </Button>
                </div>
                <b>Guild:</b>
                <div className="flex items-center gap-4">
                    <ComboSelector
                        values={guilds
                            .map((guild) => ({ label: guild.name, value: guild.id }))
                            .concat(...(guild && !guilds.some((x) => x.id === guild) ? [{ label: guild, value: guild }] : []))}
                        value={guild}
                        setValue={setGuild}
                    />
                    <Button
                        variant="secondary"
                        className="flex items-center gap-2"
                        onClick={() => {
                            const id = prompt("Enter guild ID to filter by, or leave empty to show all entries")?.trim();
                            if (id === undefined) return;

                            if (id === "") return setGuild(null);
                            if (!id.match(/^[1-9][0-9]{16,19}$/)) return alert("Invalid guild ID.");

                            setGuild(id);
                        }}
                    >
                        <FaPencil /> Input Guild ID
                    </Button>
                    <Button variant="secondary" onClick={() => setGuild(null)}>
                        <FaXmark />
                    </Button>
                </div>
                <b>Target:</b>
                <Input placeholder="Any Discord ID" value={target ?? ""} onChange={({ currentTarget: { value } }) => setTarget(value || null)} />
                <b># Per Page:</b>
                <div className="flex items-center gap-2">
                    {[10, 25, 50, 100].map((x) => (
                        <Button
                            key={x}
                            variant={pageSize === x ? "default" : "secondary"}
                            onClick={async () => {
                                setPageSize(x);
                                setData(await getAuditLogs(actor, type, guild, target, (page - 1) * x, x));
                            }}
                        >
                            {x}
                        </Button>
                    ))}
                </div>
            </div>
            <br />
            <Button
                onClick={async () => {
                    if (target && !target.match(/^[1-9][0-9]{16,19}$/)) return alert("Invalid target ID.");
                    setData(await getAuditLogs(actor, type, guild, target, (page - 1) * pageSize, pageSize));
                }}
            >
                Update
            </Button>
            <hr className="my-8" />
            <div className="flex flex-col gap-4">
                {entries.map((entry) => {
                    const guild = entry.guild ? guildRef(entry.guild) : null;

                    return (
                        <Panel key={entry.time} className="p-4">
                            <div className="prose">
                                <h2 className="mt-2">
                                    {typeNames[entry.type] ?? entry.type}
                                    <span className="font-light">
                                        {" "}
                                        &mdash; <TimeMentionFull time={new Date(entry.time)} />
                                    </span>
                                </h2>
                                <p>
                                    <UserMention id={entry.actor} />{" "}
                                    {entry.type === "guilds/create" ? (
                                        <>
                                            added <b>{entry.data.name}</b> (ID: <code>{entry.guild}</code>) to the TCN with owner{" "}
                                            <UserMention id={entry.data.owner} /> and{" "}
                                            {entry.data.advisor ? (
                                                <>
                                                    advisor <UserMention id={entry.data.advisor} />
                                                </>
                                            ) : (
                                                "no advisor"
                                            )}
                                            . The mascot is <code>{entry.data.mascot}</code>, the role name is <code>{entry.data.roleName}</code>, the role
                                            color is <code>#{entry.data.roleColor.toString(16).padStart(6, "0")}</code>, and the voter role is assigned to the{" "}
                                            {entry.data.delegated ? "advisor" : "owner"}.
                                        </>
                                    ) : entry.type === "guilds/delete" ? (
                                        <>
                                            removed {guild} (<b>{entry.data.name}</b>) from the TCN (owner was <UserMention id={entry.data.owner} />
                                            {entry.data.advisor ? (
                                                <>
                                                    {" "}
                                                    and advisor was <UserMention id={entry.data.advisor} />
                                                </>
                                            ) : null}
                                            )
                                        </>
                                    ) : entry.type === "guilds/update/owner" ? (
                                        <>
                                            changed {guild}&apos;s owner from <UserMention id={entry.data[0]} /> to <UserMention id={entry.data[1]} />.
                                        </>
                                    ) : entry.type === "guilds/update/advisor" ? (
                                        entry.data[0] ? (
                                            entry.data[1] ? (
                                                <>
                                                    changed {guild}&apos;s advisor from <UserMention id={entry.data[0]} /> to <UserMention id={entry.data[1]} />
                                                    .
                                                </>
                                            ) : (
                                                <>
                                                    removed {guild}&apos;s advisor (<UserMention id={entry.data[0]} />
                                                    ).
                                                </>
                                            )
                                        ) : (
                                            <>
                                                added <UserMention id={entry.data[1]} /> as {guild}&apos;s advisor.
                                            </>
                                        )
                                    ) : entry.type === "guilds/update/swap-representatives" ? (
                                        <>
                                            swapped {guild}&apos;s owner (now <UserMention id={entry.data[0]} />) and advisor (now{" "}
                                            <UserMention id={entry.data[1]} />
                                            ).
                                        </>
                                    ) : entry.type === "guilds/update/delegated" ? (
                                        entry.data ? (
                                            <>delegated {guild}&apos;s vote to the advisor.</>
                                        ) : (
                                            <>retuurned {guild}&apos;s vote to the owner.</>
                                        )
                                    ) : entry.type === "guilds/update/invite" ? (
                                        <>
                                            updated {guild}&apos;s invite to <code>discord.gg/{entry.data[1]}</code>.
                                        </>
                                    ) : entry.type === "guilds/update/mascot" ? (
                                        <>
                                            updated {guild}&apos;s mascot from <code>{entry.data[0]}</code> to <code>{entry.data[1]}</code>.
                                        </>
                                    ) : entry.type === "guilds/update/name" ? (
                                        <>
                                            renamed {guild} from <b>{entry.data[0]}</b> to <b>{entry.data[1]}</b>.
                                        </>
                                    ) : entry.type === "applications/vote" ? (
                                        <>
                                            initiated{" "}
                                            {
                                                {
                                                    "decline-observation": "a vote to decline observation",
                                                    "cancel-observation": "a vote to cancel ongoing observation",
                                                    "induction/normal": "a standard induction vote",
                                                    "induction/pre-approve": "a pre-approval induction vote",
                                                    "induction/positive-tiebreak": "a positive tiebreak induction vote (induct vs. pre-approve)",
                                                    "induction/negative-tiebreak": "a negative tiebreak induction vote (reject vs. extend observation)",
                                                }[entry.data as string]
                                            }{" "}
                                            on the application for <code>{entry.guild}.</code>
                                        </>
                                    ) : entry.type === "applications/rename" ? (
                                        <>
                                            renamed the application for <code>{entry.guild}</code> from <b>{entry.data[0]}</b> to <b>{entry.data[1]}</b>.
                                        </>
                                    ) : entry.type === "applications/nuke" ? (
                                        <>
                                            nuked the application for <code>{entry.guild}</code>. Data is shown below.
                                        </>
                                    ) : entry.type === "polls/reset-deadline" ? (
                                        <>reset the deadline of poll #{entry.data}.</>
                                    ) : entry.type === "polls/delete" ? (
                                        <>deleted poll #{entry.data.id}. Data is shown below.</>
                                    ) : entry.type === "reports/lock" ? (
                                        <>locked network user report #{entry.data}.</>
                                    ) : entry.type === "reports/unlock" ? (
                                        <>unlocked network user report #{entry.data}.</>
                                    ) : entry.type === "reports/reject" ? (
                                        <>rejected network user report #{entry.data}.</>
                                    ) : entry.type === "reports/restore" ? (
                                        <>restored network user report #{entry.data}.</>
                                    ) : entry.type === "reports/publish" ? (
                                        <>published network user report #{entry.data}.</>
                                    ) : entry.type === "reports/rescind" ? (
                                        <>rescinded network user report #{entry.data.report}. Explanation is shown below.</>
                                    ) : entry.type === "polls/update/add-preapprove" ? (
                                        <>added the pre-approve option to poll #{entry.data}.</>
                                    ) : entry.type === "polls/update/remove-preapprove" ? (
                                        <>removed the pre-approve option from poll #{entry.data}.</>
                                    ) : entry.type === "users/promote" ? (
                                        <>
                                            promoted <UserMention id={entry.data} /> to observer.
                                        </>
                                    ) : entry.type === "users/demote" ? (
                                        <>
                                            demoted <UserMention id={entry.data} /> from observer.
                                        </>
                                    ) : entry.type === "users/refresh-term" ? (
                                        <>
                                            refreshed <UserMention id={entry.data} />
                                            &apos;s term as observer.
                                        </>
                                    ) : entry.type === "users/update/global-nickname" ? (
                                        <>
                                            changed <UserMention id={entry.data.user} />
                                            &apos;s global nickname to <b>{entry.data.name || "(none)"}</b>.
                                        </>
                                    ) : entry.type === "global/filter/add-term" ? (
                                        <>
                                            added <code>{entry.data.term}</code> as a {entry.data.regex ? "regex" : "standard"} match to a global filter.
                                        </>
                                    ) : entry.type === "global/filter/create" ? (
                                        <>
                                            created a new global filter named <b>{entry.data}</b>.
                                        </>
                                    ) : entry.type === "global/filter/delete-term" ? (
                                        <>
                                            deleted the {entry.data.regex ? "regex" : "standard"} term <code>{entry.data.term}</code> from a global filter.
                                        </>
                                    ) : entry.type === "global/filter/delete" ? (
                                        <>
                                            deleted the global filter <b>{entry.data.name}</b>. Terms are shown below.
                                        </>
                                    ) : entry.type === "global/filter/edit-term-regex" ? (
                                        <>
                                            changed <code>{entry.data.term}</code> to a {entry.data.regex ? "regex" : "standard"} term.
                                        </>
                                    ) : entry.type === "global/filter/edit-term-term" ? (
                                        <>
                                            changed a {entry.data.regex ? "regex" : "standard"} term from <code>{entry.data.before}</code> to{" "}
                                            <code>{entry.data.term}</code>.
                                        </>
                                    ) : entry.type === "global/filter/rename" ? (
                                        <>
                                            renamed the global filter named <b>{entry.data.before}</b> to <b>{entry.data.name}</b>.
                                        </>
                                    ) : entry.type === "global/channels/create" ? (
                                        <>
                                            created a new {entry.data.visible ? "public" : "private"} global channel named <b>{entry.data.name}</b> (ID:{" "}
                                            {entry.data.id}).
                                        </>
                                    ) : entry.type === "global/channels/delete" ? (
                                        <>
                                            deleted global channel #{entry.data.id} (<b>{entry.data.name}</b>).
                                        </>
                                    ) : entry.type === "global/channels/set-name" ? (
                                        <>
                                            renamed global channel #{entry.data.id} from <b>{entry.data.oldName}</b> to <b>{entry.data.name}</b>.
                                        </>
                                    ) : entry.type === "global/channels/set-visible" ? (
                                        <>
                                            made global channel #{entry.data.id} {entry.data.visible ? "public" : "private"}.
                                        </>
                                    ) : entry.type === "global/channels/set-password" ? (
                                        <>updated the password of global channel #{entry.data.id}.</>
                                    ) : entry.type === "global/connect" ? (
                                        <>
                                            connected to global channel #{entry.data.channel} (<b>{entry.data.name}</b>) in {guild} (Discord channel ID:{" "}
                                            <code>{entry.data.location}</code>).
                                        </>
                                    ) : entry.type === "global/disconnect" ? (
                                        <>
                                            disconnected from global channel #{entry.data.channel} (<b>{entry.data.name}</b>) in {guild}.
                                        </>
                                    ) : entry.type === "global/panic" ? (
                                        <>
                                            from {guild} activated global panic mode in global channel #{entry.data.channel} (<b>{entry.data.name}</b>).
                                        </>
                                    ) : entry.type === "global/end-panic" ? (
                                        <>
                                            ended global panic mode in global channel #{entry.data.channel} (<b>{entry.data.name}</b>).
                                        </>
                                    ) : entry.type === "global/mods/add" ? (
                                        <>
                                            added <UserMention id={entry.data.user} /> to the mod team of global channel #{entry.data.channel} (
                                            <b>{entry.data.name}</b>).
                                        </>
                                    ) : entry.type === "global/mods/remove" ? (
                                        <>
                                            removed <UserMention id={entry.data.user} /> from the mod team of global channel #{entry.data.channel} (
                                            <b>{entry.data.name}</b>).
                                        </>
                                    ) : entry.type === "global/set-filters" ? (
                                        <>
                                            set the filters for global channel #{entry.data.id} (<b>{entry.data.name}</b>) to{" "}
                                            {entry.data.filters.length === 0
                                                ? "(none)"
                                                : entry.data.filters.map((filter: { id: number; name: string }, index: number) => (
                                                      <>
                                                          {index === 0 ? "" : ", "}
                                                          <b>{filter.name}</b> (<code>{filter.id}</code>)
                                                      </>
                                                  ))}
                                            .
                                        </>
                                    ) : null}
                                </p>
                                {entry.type === "applications/nuke" ? (
                                    <pre>
                                        <code>{JSON.stringify((({ url, ...data }) => data)(entry.data.application), null, 4)}</code>
                                    </pre>
                                ) : entry.type === "polls/delete" ? (
                                    <pre>
                                        <code>{JSON.stringify((({ id, ...data }) => data)(entry.data), null, 4)}</code>
                                    </pre>
                                ) : entry.type === "reports/rescind" ? (
                                    <pre>
                                        <code>{entry.data.explanation}</code>
                                    </pre>
                                ) : entry.type === "global/filters/delete" ? (
                                    <pre>
                                        <code>{JSON.stringify(entry.data.terms, null, 4)}</code>
                                    </pre>
                                ) : null}
                            </div>
                        </Panel>
                    );
                })}
            </div>
            <br />
            <AutoPaginate
                page={page}
                pages={pages}
                setPage={setPage}
                update={async (page) => setData(await getAuditLogs(actor, type, guild, target, (page - 1) * pageSize, pageSize))}
            />
        </>
    );
}
