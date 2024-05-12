import { BaseMessageOptions, ButtonStyle, ComponentType, Message, escapeMarkdown } from "discord.js";
import { and, eq } from "drizzle-orm";
import { channels } from "../bot.js";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { englishList, shuffle, timeinfo } from "../lib.js";
import { getTurnoutAndQuorum, getVoters } from "./api-lib.js";
import { template } from "./bot-lib.js";

export const unrestrictedTypes: string[] = ["election"];
export const majorTypes: string[] = ["cancel-observation"];

export async function verifyTypeAndFetchPollID(message: string, type: string): Promise<number> {
    const poll = await db.query.polls.findFirst({ columns: { id: true, type: true }, where: eq(tables.polls.message, message) });

    if (!poll) throw "This poll could not be found in the database.";
    if (poll.type !== type) throw `Poll type is invalid (expected \`${type}\`, found \`${poll.type}\`).`;

    return poll.id;
}

export async function registerVote(id: number, user: string) {
    await db.insert(tables.voteTracker).values({ poll: id, user }).onDuplicateKeyUpdate({ set: { user } });
}

export async function newPoll(
    type: "decline-observation" | "cancel-observation" | "induction" | "election" | "proposal" | "selection",
    fn: (ref: number) => Promise<Message>,
    config?: { reminder?: number; deadline?: number },
) {
    const reminder = config?.reminder ?? 86400000;
    const deadline = config?.deadline ?? 172800000;

    const [{ insertId }] = await db.insert(tables.polls).values({
        type,
        message: "",
        reminder: Date.now() + reminder,
        deadline: Date.now() + deadline,
        closed: false,
        trulyClosed: false,
    });

    const message = await fn(insertId);

    await db.update(tables.polls).set({ message: message.id }).where(eq(tables.polls.id, insertId));

    return { ref: insertId, message };
}

export async function renderPoll(id: number): Promise<BaseMessageOptions> {
    const base = await db.query.polls.findFirst({ where: eq(tables.polls.id, id) });
    if (!base) return template.error(`Poll #${id} does not exist in the database.`);

    const [turnout, quorum] = await getTurnoutAndQuorum(id, base.type);

    return {
        embeds: [
            {
                author: { name: `Poll #${id}` },
                title: `${(turnout * 100).toFixed(2)}% Turnout Reached`,
                description: await renderDescription(id, base.type),
                color: 0x2b2d31,
                fields: base.closed
                    ? [
                          {
                              name: "Results",
                              value: quorum ? await renderResults(id, base.type) : "Quorum not met. Results are not shown.",
                          },
                      ]
                    : [{ name: "Deadline", value: timeinfo(base.deadline) }],
            },
        ],
        components: [
            ...(await renderComponents(id, base.type, base.closed)),
            {
                type: ComponentType.ActionRow,
                components: [
                    {
                        type: ComponentType.Button,
                        customId: `:poll/view:${base.type}`,
                        style: ButtonStyle.Secondary,
                        label: "View My Vote",
                        disabled: base.closed,
                    },
                    { type: ComponentType.Button, customId: `:poll/info:${base.type}`, style: ButtonStyle.Primary, label: "Info" },
                    { type: ComponentType.Button, customId: `:poll/delete:${base.type}`, style: ButtonStyle.Danger, label: "Delete" },
                    { type: ComponentType.Button, customId: `:poll/reset-deadline:${base.type}`, style: ButtonStyle.Danger, label: "Reset Deadline" },
                ],
            },
        ],
    };
}

export async function renderDescription(id: number, type: string): Promise<string> {
    if (["decline-observation", "cancel-observation", "induction"].includes(type)) {
        const [data] = await db
            .select({ thread: tables.applications.thread, name: tables.applications.name, url: tables.applications.url })
            .from(tables.applicationPolls)
            .innerJoin(tables.applications, eq(tables.applicationPolls.thread, tables.applications.thread))
            .where(eq(tables.applicationPolls.ref, id));

        if (!data) return `Failed to fetch poll #${id} (type: ${type}).`;

        const link = `**[${escapeMarkdown(data.name)}](${data.url})**`;

        if (type === "decline-observation") return `Reject ${link} without observation?`;
        else if (type === "cancel-observation") return `Reject ${link} and cancel their ongoing observation?`;
        else if (type === "induction") {
            const more = await db.query.inductionPolls.findFirst({ columns: { mode: true }, where: eq(tables.inductionPolls.ref, id) });
            if (!more) return `Failed to fetch poll #${id} (type: ${type}).`;

            if (more.mode === "normal" || more.mode === "pre-approve") return `Induct ${link}?`;
            if (more.mode === "positive-tiebreak") return `Induct or pre-approve ${link}?`;
            if (more.mode === "negative-tiebreak") return `Reject or extend observation for ${link}?`;
        }
    } else if (type === "election") {
        const [data] = await db
            .select({ wave: tables.elections.wave })
            .from(tables.electionPolls)
            .innerJoin(tables.elections, eq(tables.electionPolls.thread, tables.elections.channel))
            .where(eq(tables.electionPolls.ref, id));

        if (!data) return `Failed to fetch poll #${id} (type: ${type}).`;

        return `Please vote in the Wave ${data.wave} Election.`;
    } else if (type === "proposal") {
        const data = await db.query.proposalPolls.findFirst({ columns: { question: true }, where: eq(tables.proposalPolls.ref, id) });
        if (!data) return `Failed to fetch poll #${id} (type: ${type}).`;

        return data.question;
    } else if (type === "selection") {
        const data = await db.query.selectionPolls.findFirst({ columns: { question: true }, where: eq(tables.selectionPolls.ref, id) });
        if (!data) return `Failed to fetch poll #${id} (type: ${type}).`;

        return data.question;
    }

    return `Unknown Poll Type / Unexpected Error: \`${type}\`.`;
}

function isTie(x: number, y: number) {
    return x === y || (x * 3 > y * 2 && x * 2 < y * 3);
}

function resolveVerdict<T extends string, U extends string, S extends string = "tie">(x: number, y: number, xl: T, yl: U, tie?: S) {
    return isTie(x, y) ? ((tie ?? "tie") as S) : x > y ? xl : yl;
}

function abstainInfo(x: number) {
    return `${x} voter${x === 1 ? "" : "s"} abstained.`;
}

function addVerdict<T extends string, U extends string, R, S extends string = "tie">(
    tally: Record<T | U, number> & R,
    x: T,
    y: U,
    tie?: S,
): { verdict: S | T | U } & Record<T | U, number> & R {
    return { verdict: resolveVerdict(tally[x], tally[y], x, y, tie), ...tally };
}

async function filterVotes<T extends { user: string }>(votes: T[], type: string): Promise<T[]> {
    const voters = new Set(await getVoters(unrestrictedTypes.includes(type)));
    return votes.filter((vote) => voters.has(vote.user));
}

export async function getDeclineObservationResults(
    id: number,
): Promise<{ verdict: "tie" | "decline" | "proceed"; decline: number; proceed: number; abstain: number }> {
    const votes = await filterVotes(
        await db.query.declineObservationVotes.findMany({ where: eq(tables.declineObservationVotes.ref, id) }),
        "decline-observation",
    );

    const tally = { decline: 0, proceed: 0, abstain: 0 };

    for (const vote of votes) tally[vote.vote]++;

    return addVerdict(tally, "decline", "proceed");
}

export async function getCancelObservationResults(
    id: number,
): Promise<{ verdict: "tie" | "cancel" | "continue"; cancel: number; continue: number; abstain: number }> {
    const votes = await filterVotes(await db.query.cancelObservationVotes.findMany({ where: eq(tables.cancelObservationVotes.ref, id) }), "cancel-observation");
    const tally = { cancel: 0, continue: 0, abstain: 0 };

    for (const vote of votes) tally[vote.vote]++;

    return addVerdict(tally, "cancel", "continue");
}

export async function getInductionResults(
    id: number,
    mode: "normal" | "pre-approve" | "positive-tiebreak" | "negative-tiebreak",
): Promise<{
    verdict: "tie" | "positive-tie" | "negative-tie" | "induct" | "preapprove" | "reject" | "extend";
    induct: number;
    preapprove: number;
    reject: number;
    extend: number;
    abstain: number;
}> {
    const votes = await filterVotes(await db.query.inductionVotes.findMany({ where: eq(tables.inductionVotes.ref, id) }), "induction");
    const tally = { induct: 0, preapprove: 0, reject: 0, extend: 0, abstain: 0 };

    for (const vote of votes) tally[vote.vote]++;

    if (mode === "normal") {
        tally.induct += tally.preapprove;

        if (isTie(tally.induct, tally.reject + tally.extend)) return { verdict: "tie", ...tally };
        if (tally.induct > tally.reject + tally.extend) return { verdict: "induct", ...tally };
        return addVerdict(tally, "reject", "extend", "negative-tie");
    } else if (mode === "pre-approve") {
        if (isTie(tally.induct + tally.preapprove, tally.reject + tally.extend)) return { verdict: "tie", ...tally };
        if (tally.induct + tally.preapprove > tally.reject + tally.extend) return addVerdict(tally, "induct", "preapprove", "positive-tie");
        return addVerdict(tally, "reject", "extend", "negative-tie");
    } else if (mode === "positive-tiebreak") return addVerdict(tally, "induct", "preapprove");
    else return addVerdict(tally, "reject", "extend");
}

export async function getElectionResults(id: number): Promise<{ winners: string[]; ties: string[]; runnerups: string[] }> {
    const [poll] = await db
        .select({ seats: tables.elections.seats, candidates: tables.electionPolls.candidates })
        .from(tables.electionPolls)
        .innerJoin(tables.elections, eq(tables.electionPolls.thread, tables.elections.channel))
        .where(eq(tables.electionPolls.ref, id));

    if (!poll) return { winners: [], ties: [], runnerups: [] };

    const candidates = poll.candidates as string[];

    const votes = await filterVotes(
        await db.query.electionVotes.findMany({ columns: { user: true, vote: true }, where: eq(tables.electionVotes.ref, id) }),
        "election",
    );

    const score = Object.fromEntries(candidates.map((candidate) => [candidate, 0]));
    const anti = Object.fromEntries(candidates.map((candidate) => [candidate, 0]));

    for (const { vote } of votes as { vote: { ranked: string[]; countered: string[] } }[]) {
        vote.ranked.forEach((candidate, i) => (score[candidate] += poll.seats - i));
        vote.countered.forEach((candidate) => anti[candidate]++);
    }

    const results = Object.entries(score)
        .filter(([candidate]) => anti[candidate] * 2 <= votes.length)
        .sort(([, a], [, b]) => b - a)
        .map(([candidate]) => candidate);

    if (results.length <= poll.seats) return { winners: shuffle(results), ties: [], runnerups: [] };

    if (score[results[poll.seats - 1]] === score[results[poll.seats]]) {
        const threshold = score[results[poll.seats - 1]];

        const winners: string[] = [];
        const ties: string[] = [];

        for (const candidate of results) {
            if (score[candidate] > threshold) winners.push(candidate);
            else if (score[candidate] === threshold) ties.push(candidate);
            else break;
        }

        return {
            winners: shuffle(winners),
            ties: shuffle(ties),
            runnerups: shuffle(candidates.filter((candidate) => !winners.includes(candidate) && !ties.includes(candidate))),
        };
    }

    return { winners: shuffle(results.slice(0, poll.seats)), ties: [], runnerups: shuffle(results.slice(poll.seats)) };
}

export async function getProposalResults(id: number): Promise<{ verdict: "tie" | "accept" | "reject"; accept: number; reject: number; abstain: number }> {
    const votes = await filterVotes(await db.query.proposalVotes.findMany({ where: eq(tables.proposalVotes.ref, id) }), "proposal");

    const tally = { accept: 0, reject: 0, abstain: 0 };

    for (const vote of votes) tally[vote.vote]++;

    return addVerdict(tally, "accept", "reject");
}

export async function getSelectionResults(id: number): Promise<{ results: Record<string, number>; abstain: number }> {
    const poll = await db.query.selectionPolls.findFirst({ columns: { options: true }, where: eq(tables.selectionPolls.ref, id) });
    if (!poll) return { results: {}, abstain: 0 };

    const votes = await filterVotes(await db.query.selectionVotes.findMany({ where: eq(tables.selectionVotes.ref, id) }), "selection");

    const results = Object.fromEntries((poll.options as string[]).map((option) => [option, 0]));
    let abstain = 0;

    for (const { vote } of votes as { vote: string[] }[])
        if (vote.length === 0) abstain++;
        else for (const option of vote) results[option]++;

    return { results, abstain };
}

export async function renderResults(id: number, type: string): Promise<string> {
    if (type === "decline-observation") {
        const { verdict, decline, proceed, abstain } = await getDeclineObservationResults(id);

        return verdict === "tie"
            ? `The council's vote tied with ${decline} in favor of declining and ${proceed} against. ${abstainInfo(abstain)}`
            : verdict === "decline"
            ? `The council voted ${decline} : ${proceed} to reject without observation. ${abstainInfo(abstain)}`
            : verdict === "proceed"
            ? `The council voted ${proceed} : ${decline} to proceed with observing this applicant. ${abstainInfo(abstain)}`
            : "?";
    } else if (type === "cancel-observation") {
        const { verdict, cancel, continue: cont, abstain } = await getCancelObservationResults(id);

        return verdict === "tie"
            ? `The council's vote tied with ${cancel} in favor of canceling and ${cont} against. ${abstainInfo(abstain)}`
            : verdict === "cancel"
            ? `The council voted ${cancel} : ${cont} to reject and cancel the ongoing observation. ${abstainInfo(abstain)}`
            : verdict === "continue"
            ? `The council voted ${cont} : ${cancel} to continue observing this applicant. ${abstainInfo(abstain)}`
            : "?";
    } else if (type === "induction") {
        const poll = await db.query.inductionPolls.findFirst({ columns: { mode: true }, where: eq(tables.inductionPolls.ref, id) });
        if (!poll) return "Could not fetch induction poll data.";

        const { verdict, induct, preapprove, reject, extend, abstain } = await getInductionResults(id, poll.mode);

        return poll.mode === "normal"
            ? verdict === "tie"
                ? `The council's vote tied with ${induct} in favor of inducting and ${reject} (reject) + ${extend} (extend) against. ${abstainInfo(abstain)})`
                : verdict === "induct"
                ? `The council voted ${induct} : ${reject} (reject) + ${extend} (extend) to induct this applicant. ${abstainInfo(abstain)}`
                : verdict === "reject"
                ? `The council voted ${reject} : ${induct} (induct) + ${extend} (extend) to reject this applicant. ${abstainInfo(abstain)}`
                : verdict === "extend"
                ? `The council voted ${extend} : ${induct} (induct) + ${reject} (reject) to extend observation. ${abstainInfo(abstain)}`
                : verdict === "negative-tie"
                ? `The council's vote tied between rejecting and extending observation with ${reject} in favor of rejecting and ${extend} in favor of extending observation. ${induct} voter${
                      induct === 1 ? "" : "s"
                  } voted to induct. ${abstainInfo(abstain)}`
                : "?"
            : poll.mode === "pre-approve"
            ? verdict === "tie"
                ? `The council's vote tied with ${induct} (induct) + ${preapprove} (pre-approve) in favor of approval and ${reject} (reject) + ${extend} (extend) against. ${abstainInfo(
                      abstain,
                  )}`
                : verdict === "induct"
                ? `The council voted ${induct} : ${preapprove} (pre-approve) + ${reject} (reject) + ${extend} (extend) to induct this applicant. ${abstainInfo(
                      abstain,
                  )}`
                : verdict === "preapprove"
                ? `The council voted ${preapprove} : ${induct} (induct) + ${reject} (reject) + ${extend} (extend) to induct this applicant. ${abstainInfo(
                      abstain,
                  )}`
                : verdict === "reject"
                ? `The council voted ${reject} : ${induct} (induct) + ${preapprove} (pre-approve) + ${extend} (extend) to induct this applicant. ${abstainInfo(
                      abstain,
                  )}`
                : verdict === "extend"
                ? `The council voted ${extend} : ${induct} (induct) + ${preapprove} (pre-approve) + ${reject} (reject) to induct this applicant. ${abstainInfo(
                      abstain,
                  )}`
                : verdict === "positive-tie"
                ? `The council's vote tied between inducting and pre-approving with ${induct} in favor of inducting and ${preapprove} in favor of pre-approving. ${reject} voter${
                      reject === 1 ? "" : "s"
                  } voted to reject and ${extend} voter${extend === 1 ? "" : "s"} voted to extend observation. ${abstainInfo(abstain)}`
                : verdict === "negative-tie"
                ? `The council's vote tied between rejecting and extending observation with ${reject} in favor of rejecting and ${extend} in favor of extending observation. ${induct} voter${
                      induct === 1 ? "" : "s"
                  } voted to induct and ${preapprove} voter${preapprove === 1 ? "" : "s"} voted to pre-approve. ${abstainInfo(abstain)}`
                : "?"
            : poll.mode === "positive-tiebreak"
            ? verdict === "tie"
                ? `The council's vote tied with ${induct} in favor of inducting now and ${preapprove} in favor of pre-approving. ${abstainInfo(abstain)}`
                : verdict === "induct"
                ? `The council voted ${induct} : ${preapprove} to induct this applicant now rather than pre-approving. ${abstainInfo(abstain)}`
                : verdict === "preapprove"
                ? `The council voted ${preapprove} : ${induct} to pre-approve this applicant rather than inducting them now. ${abstainInfo(abstain)}`
                : "?"
            : poll.mode === "negative-tiebreak"
            ? verdict === "tie"
                ? `The council's vote tied with ${reject} in favor of rejecting and ${extend} in favor of extending observation. ${abstainInfo(abstain)}`
                : verdict === "reject"
                ? `The council voted ${reject} : ${extend} to reject this applicant rather than extending observation. ${abstainInfo(abstain)}`
                : verdict === "extend"
                ? `The council voted ${extend} : ${reject} to extend observation for this applicant rather than rejecting them. ${abstainInfo(abstain)}`
                : "?"
            : "?";
    } else if (type === "election") {
        const { winners, ties } = await getElectionResults(id);

        if (winners.length === 0)
            if (ties.length === 0) return "No candidates were approved by the council and this election has no winners.";
            else return `The election ended in a tie ${ties.length === 2 ? "between" : "amongst"} ${englishList(ties.map((id) => `<@${id}>`))}.`;
        else if (ties.length === 0) return `This election's winners are ${englishList(winners.map((id) => `<@${id}>`))}.`;
        else
            return `This election was won by ${englishList(winners.map((id) => `<@${id}>`))} and also resulted in a tie ${
                ties.length === 2 ? "between" : "amongst"
            } ${englishList(ties.map((id) => `<@${id}>`))}.`;
    } else if (type === "proposal") {
        const { verdict, accept, reject, abstain } = await getProposalResults(id);

        return verdict === "tie"
            ? `The council's vote tied with ${accept} in favor of accepting and ${reject} against. ${abstainInfo(abstain)}`
            : verdict === "accept"
            ? `The council voted ${accept} : ${reject} to accept this proposal. ${abstainInfo(abstain)}`
            : `The council voted ${reject} : ${accept} to reject this proposal. ${abstainInfo(abstain)}`;
    } else if (type === "selection") {
        const { results, abstain } = await getSelectionResults(id);

        return `${Object.entries(results)
            .map(([option, votes]) => `- ${votes} vote${votes === 1 ? "" : "s"} for: ${option}`)
            .join("\n")}\n\n${abstainInfo(abstain)}`;
    }

    return `Unknown Poll Type / Unexpected Error: \`${type}\`.`;
}

export async function renderComponents(id: number, type: string, disabled: boolean): Promise<Exclude<BaseMessageOptions["components"], undefined>> {
    if (type === "decline-observation")
        return [
            {
                type: ComponentType.ActionRow,
                components: [
                    {
                        type: ComponentType.Button,
                        customId: ":poll/decline-observation:decline",
                        style: ButtonStyle.Danger,
                        label: "Decline Observation",
                        disabled,
                    },
                    {
                        type: ComponentType.Button,
                        customId: ":poll/decline-observation:proceed",
                        style: ButtonStyle.Primary,
                        label: "Proceed With Observation",
                        disabled,
                    },
                    {
                        type: ComponentType.Button,
                        customId: ":poll/decline-observation:abstain",
                        style: ButtonStyle.Secondary,
                        label: "Abstain",
                        disabled,
                    },
                ],
            },
        ];

    if (type === "cancel-observation")
        return [
            {
                type: ComponentType.ActionRow,
                components: [
                    {
                        type: ComponentType.Button,
                        customId: ":poll/cancel-observation:cancel",
                        style: ButtonStyle.Danger,
                        label: "Cancel Observation",
                        disabled,
                    },
                    {
                        type: ComponentType.Button,
                        customId: ":poll/cancel-observation:continue",
                        style: ButtonStyle.Primary,
                        label: "Continue Observing",
                        disabled,
                    },
                    {
                        type: ComponentType.Button,
                        customId: ":poll/cancel-observation:abstain",
                        style: ButtonStyle.Secondary,
                        label: "Abstain",
                        disabled,
                    },
                ],
            },
        ];

    if (type === "induction") {
        const poll = await db.query.inductionPolls.findFirst({ columns: { mode: true }, where: eq(tables.inductionPolls.ref, id) });

        if (poll)
            return [
                {
                    type: ComponentType.ActionRow,
                    components:
                        poll.mode === "normal" || poll.mode === "pre-approve"
                            ? [
                                  {
                                      type: ComponentType.StringSelect,
                                      customId: ":poll/induction/menu",
                                      options: [
                                          { label: poll.mode === "normal" ? "Induct" : "Induct Now", value: "induct", emoji: "🟩" },
                                          poll.mode === "pre-approve" ? { label: "Pre-Approve", value: "preapprove", emoji: "🟨" } : [],
                                          { label: "Reject", value: "reject", emoji: "🟥" },
                                          { label: "Extend Observation", value: "extend", emoji: "🟪" },
                                          {
                                              label: poll.mode === "normal" ? "Add Pre-Approve Option" : "Remove Pre-Approve Option",
                                              value: poll.mode === "normal" ? "add-preapprove" : "remove-preapprove",
                                              emoji: "🔀",
                                          },
                                      ].flat(),
                                      disabled,
                                  },
                              ]
                            : poll.mode === "positive-tiebreak"
                            ? [
                                  {
                                      type: ComponentType.Button,
                                      customId: ":poll/induction/button:induct",
                                      style: ButtonStyle.Success,
                                      label: "Induct Now",
                                      disabled,
                                  },
                                  {
                                      type: ComponentType.Button,
                                      customId: ":poll/induction/button:preapprove",
                                      style: ButtonStyle.Primary,
                                      label: "Pre-Approve",
                                      disabled,
                                  },
                              ]
                            : [
                                  {
                                      type: ComponentType.Button,
                                      customId: ":poll/induction/button:reject",
                                      style: ButtonStyle.Success,
                                      label: "Reject",
                                      disabled,
                                  },
                                  {
                                      type: ComponentType.Button,
                                      customId: ":poll/induction/button:extend",
                                      style: ButtonStyle.Primary,
                                      label: "Extend Observation",
                                      disabled,
                                  },
                              ],
                },
            ];
    }

    if (type === "election") {
        const poll = await db.query.electionPolls.findFirst({ columns: { autopromoted: true }, where: eq(tables.inductionPolls.ref, id) });

        if (poll)
            return [
                {
                    type: ComponentType.ActionRow,
                    components: [
                        {
                            type: ComponentType.Button,
                            customId: ":poll/election/vote",
                            style: ButtonStyle.Primary,
                            label: "Vote",
                            disabled,
                        },
                        {
                            type: ComponentType.Button,
                            customId: ":poll/election/abstain",
                            style: ButtonStyle.Secondary,
                            label: "Abstain",
                            disabled,
                        },
                        ...(disabled && !poll.autopromoted
                            ? ([
                                  {
                                      type: ComponentType.Button,
                                      customId: ":poll/election/auto-promote",
                                      style: ButtonStyle.Success,
                                      label: "Auto-Promote",
                                  },
                                  {
                                      type: ComponentType.Button,
                                      customId: ":poll/election/remove-auto-promote",
                                      style: ButtonStyle.Danger,
                                      label: "Remove Auto-Promote Option",
                                  },
                              ] as const)
                            : []),
                    ],
                },
            ];
    }

    if (type === "proposal")
        return [
            {
                type: ComponentType.ActionRow,
                components: [
                    {
                        type: ComponentType.Button,
                        customId: ":poll/proposal:accept",
                        style: ButtonStyle.Success,
                        label: "Accept",
                        disabled,
                    },
                    {
                        type: ComponentType.Button,
                        customId: ":poll/proposal:reject",
                        style: ButtonStyle.Danger,
                        label: "Reject",
                        disabled,
                    },
                    {
                        type: ComponentType.Button,
                        customId: ":poll/proposal:abstain",
                        style: ButtonStyle.Secondary,
                        label: "Abstain",
                        disabled,
                    },
                ],
            },
        ];

    if (type === "selection") {
        const poll = await db.query.selectionPolls.findFirst({
            columns: { options: true, minimum: true, maximum: true },
            where: eq(tables.selectionPolls.ref, id),
        });

        if (poll)
            return [
                {
                    type: ComponentType.ActionRow,
                    components: [
                        {
                            type: ComponentType.StringSelect,
                            customId: ":poll/selection/menu",
                            options: (poll.options as string[]).map((option) => ({ label: option, value: option })),
                            minValues: poll.minimum,
                            maxValues: poll.maximum,
                            disabled,
                        },
                    ],
                },
                {
                    type: ComponentType.ActionRow,
                    components: [
                        {
                            type: ComponentType.Button,
                            customId: ":poll/selection/abstain",
                            style: ButtonStyle.Secondary,
                            label: "Abstain",
                            disabled,
                        },
                    ],
                },
            ];
    }

    return [
        {
            type: ComponentType.ActionRow,
            components: [
                {
                    type: ComponentType.Button,
                    customId: ".",
                    style: ButtonStyle.Secondary,
                    label: "Unknown Poll Type / Unexpected Error",
                    disabled: true,
                },
            ],
        },
    ];
}

export async function renderVote(id: number, user: string, type: string): Promise<string> {
    if (type === "decline-observation") {
        const vote = await db.query.declineObservationVotes.findFirst({
            columns: { vote: true },
            where: and(eq(tables.declineObservationVotes.ref, id), eq(tables.declineObservationVotes.user, user)),
        });

        if (!vote) return "You have not voted on this poll.";

        return {
            decline: "You have voted to reject and decline without observation.",
            proceed: "You have voted to proceed with observing the server.",
            abstain: "You have abstained.",
        }[vote.vote];
    } else if (type === "cancel-observation") {
        const vote = await db.query.cancelObservationVotes.findFirst({
            columns: { vote: true },
            where: and(eq(tables.cancelObservationVotes.ref, id), eq(tables.cancelObservationVotes.user, user)),
        });

        if (!vote) return "You have not voted on this poll.";

        return {
            cancel: "You have voted to cancel this observation and reject the applicant.",
            continue: "You have voted to continue observing the server.",
            abstain: "You have abstained.",
        }[vote.vote];
    } else if (type === "induction") {
        const poll = await db.query.inductionPolls.findFirst({ columns: { mode: true }, where: eq(tables.inductionPolls.ref, id) });
        if (!poll) return "Error fetching induction poll data.";

        const vote = await db.query.inductionVotes.findFirst({
            columns: { vote: true },
            where: and(eq(tables.inductionVotes.ref, id), eq(tables.inductionVotes.user, user)),
        });

        if (!vote) return "You have not voted on this poll.";

        if (poll.mode === "normal") {
            if (vote.vote === "preapprove")
                return "Your original vote was to pre-approve, but since that option has been removed, your vote will be counted as a vote to induct. (If the option is re-added, your vote will be restored.)";
        } else if (poll.mode === "positive-tiebreak") {
            if (vote.vote === "reject" || vote.vote === "extend") return "Your vote is not valid for this poll type. Please vote again.";
        } else if (poll.mode === "negative-tiebreak") {
            if (vote.vote === "induct" || vote.vote === "preapprove") return "Your vote is not valid for this poll type. Please vote again.";
        }

        return {
            induct: "You have voted to induct this applicant.",
            preapprove: "You have voted to pre-approve this applicant for induction later.",
            reject: "You have voted to reject this applicant.",
            extend: "You have voted to extend this applicant's observation.",
            abstain: "You have abstained.",
        }[vote.vote];
    } else if (type === "election") {
        const poll = await db.query.electionPolls.findFirst({ columns: { candidates: true }, where: eq(tables.electionPolls.ref, id) });
        if (!poll) return "Error fetching election poll data.";

        const candidates = poll.candidates as string[];

        const vote = await db.query.electionVotes.findFirst({
            columns: { vote: true },
            where: and(eq(tables.electionVotes.ref, id), eq(tables.electionVotes.user, user)),
        });

        if (!vote) return "You have not voted on this poll.";

        const { ranked, countered } = vote.vote as { ranked: string[]; countered: string[] };

        if (ranked.length === 0)
            if (countered.length === 0) return "You have abstained for all candidates in this election.";
            else return `You did not vote in favor of any candidates and voted against ${englishList(countered.map((id) => `<@${id}>`))}.`;
        else if (ranked.length === 1)
            if (countered.length === 0) return `You voted for <@${ranked[0]}>${candidates.length === 1 ? "" : " and abstained for all other candidates"}.`;
            else
                return `You voted for <@${ranked[0]}> and against ${englishList(countered.map((id) => `<@${id}>`))}${
                    candidates.length === countered.length + 1 ? "" : " and abstained for all other candidates"
                }.`;
        else
            return `You voted for the following candidates (in order, with highest preference first):\n\n${ranked
                .map((id, i) => `${i + 1}. <@${id}>`)
                .join("\n")}\n\n${countered.length > 0 ? `You also voted against ${englishList(countered.map((id) => `<@${id}>`))}. ` : ""}${
                candidates.length === countered.length + ranked.length ? "" : "You abstained for all other candidates."
            }`;
    } else if (type === "proposal") {
        const vote = await db.query.proposalVotes.findFirst({
            columns: { vote: true },
            where: and(eq(tables.proposalVotes.ref, id), eq(tables.proposalVotes.user, user)),
        });

        if (!vote) return "You have not voted on this poll.";

        return {
            accept: "You have voted to accept this proposal.",
            reject: "You have voted to reject this proposal.",
            abstain: "You have abstained on this proposal.",
        }[vote.vote];
    } else if (type === "selection") {
        const poll = await db.query.selectionPolls.findFirst({ columns: { options: true }, where: eq(tables.selectionPolls.ref, id) });
        if (!poll) return "Error fetching selection poll data.";

        const options = poll.options as string[];
        const position = Object.fromEntries(options.map((option, i) => [option, i]));

        const entry = await db.query.selectionVotes.findFirst({
            columns: { vote: true },
            where: and(eq(tables.selectionVotes.ref, id), eq(tables.selectionVotes.user, user)),
        });

        if (!entry) return "You have not voted on this poll.";

        const vote = entry.vote as string[];

        if (vote.length === 0) return "You have abstained for all options in this poll.";
        if (vote.length === 1) return `You have voted for: ${vote[0]}`;

        return `You have voted for the following options:\n\n${vote
            .sort((x, y) => position[x] - position[y])
            .map((option) => `- ${option}`)
            .join("\n")}`;
    }

    throw "Invalid poll type or the vote render handler is broken.";
}

export async function reloadApplicationPolls(thread: string) {
    const polls = await db
        .select({ id: tables.polls.id, message: tables.polls.message })
        .from(tables.polls)
        .innerJoin(tables.applicationPolls, eq(tables.polls.id, tables.applicationPolls.ref))
        .where(eq(tables.applicationPolls.thread, thread));

    for (const poll of polls)
        try {
            const message = await channels.voteHere.messages.fetch(poll.message);
            await message.edit(await renderPoll(poll.id));
        } catch (error) {
            channels.logs.send(`Error bumping poll #${poll.id} for applicant renaming: ${error}`);
            console.error(error);
        }
}
