export const electionThreadTagToStatus = {
    [process.env.TAG_ELECTION_NOMINATING!]: "nominating",
    [process.env.TAG_ELECTION_VOTING!]: "voting",
    [process.env.TAG_ELECTION_DONE!]: "done",
} as const;

export const electionThreadStatusToTag: Record<(typeof electionThreadTagToStatus)[keyof typeof electionThreadTagToStatus], string> = {
    nominating: process.env.TAG_ELECTION_NOMINATING!,
    voting: process.env.TAG_ELECTION_VOTING!,
    done: process.env.TAG_ELECTION_DONE!,
} as const;
