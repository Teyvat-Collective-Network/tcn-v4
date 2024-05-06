import { BaseMessageOptions, ButtonStyle, ComponentType, Message, escapeMarkdown } from "discord.js";
import { and, eq } from "drizzle-orm";
import { channels } from "../bot.js";
import { db } from "../db/db.js";
import tables from "../db/tables.js";
import { timeinfo } from "../lib.js";
import { getTurnoutAndQuorum } from "./api-lib.js";
import { template } from "./bot-lib.js";

export const unrestrictedTypes: string[] = [];
export const majorTypes: string[] = [];

export async function verifyTypeAndFetchPollID(message: string, type: string): Promise<number> {
    const poll = await db.query.polls.findFirst({ columns: { id: true, type: true }, where: eq(tables.polls.message, message) });

    if (!poll) throw "This poll could not be found in the database.";
    if (poll.type !== type) throw `Poll type is invalid (expected \`${type}\`, found \`${poll.type}\`).`;

    return poll.id;
}

export async function registerVote(id: number, user: string) {
    await db.insert(tables.voteTracker).values({ poll: id, user }).onDuplicateKeyUpdate({ set: { user } });
}

export async function newPoll(type: "decline-observation", fn: (ref: number) => Promise<Message>, config?: { reminder?: number; deadline?: number }) {
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
                              value: quorum ? "Quorum not met. Results are not shown." : await renderResults(id, base.type),
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
    if (["decline-observation"].includes(type)) {
        const [data] = await db
            .select({ thread: tables.applications.thread, name: tables.applications.name, url: tables.applications.url })
            .from(tables.applicationPolls)
            .innerJoin(tables.applications, eq(tables.applicationPolls.thread, tables.applications.thread))
            .where(eq(tables.applicationPolls.ref, id));

        if (!data) return `Failed to fetch poll #${id} (type: ${type}).`;

        if (type === "decline-observation") return `Reject **[${escapeMarkdown(data.name)}](${data.url})** without observation?`;
    }

    return `Unknown Poll Type / Unexpected Error: \`${type}\`.`;
}

function isTie(x: number, y: number) {
    return x === y || (x * 3 > y * 2 && x * 2 < y * 3);
}

function resolveVerdict<T extends string, U extends string>(x: number, y: number, xl: T, yl: U) {
    return isTie(x, y) ? "tie" : x > y ? xl : yl;
}

function abstainInfo(x: number) {
    return `${x} voter${x === 1 ? "" : "s"} abstained.`;
}

function addVerdict<T extends string, U extends string>(
    tally: Record<T | U, number> & { abstain: number },
    x: T,
    y: U,
): { verdict: "tie" | T | U; abstain: number } & Record<T | U, number> {
    return { verdict: resolveVerdict(tally[x], tally[y], x, y), ...tally };
}

export async function getDeclineObservationResults(
    id: number,
): Promise<{ verdict: "tie" | "decline" | "proceed"; decline: number; proceed: number; abstain: number }> {
    const votes = await db.query.declineObservationVotes.findMany({ where: eq(tables.declineObservationVotes.ref, id) });
    const tally = { decline: 0, proceed: 0, abstain: 0 };

    for (const vote of votes) tally[vote.vote]++;

    return addVerdict(tally, "decline", "proceed");
}

export async function renderResults(id: number, type: string): Promise<string> {
    if (type === "decline-observation") {
        const { verdict, decline, proceed, abstain } = await getDeclineObservationResults(id);

        return verdict === "tie"
            ? `The council's vote tied with ${decline} in favor of declining and ${proceed} against. ${abstainInfo(abstain)}`
            : verdict === "decline"
            ? `The council voted ${decline} : ${proceed} to reject without observation. ${abstainInfo(abstain)}`
            : `The council voted ${proceed} : ${decline} to proceed with observing this applicant. ${abstainInfo(abstain)}`;
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
                    { type: ComponentType.Button, customId: ":poll/decline-observation:abstain", style: ButtonStyle.Secondary, label: "Abstain", disabled },
                ],
            },
        ];

    return [
        {
            type: ComponentType.ActionRow,
            components: [
                { type: ComponentType.Button, customId: ".", style: ButtonStyle.Secondary, label: "Unknown Poll Type / Unexpected Error", disabled: true },
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
