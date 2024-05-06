import { sql } from "drizzle-orm";
import { bigint, boolean, int, mysqlEnum, mysqlTable, primaryKey, text, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
    id: varchar("id", { length: 20 }).primaryKey(),
    observer: boolean("observer").notNull().default(false),
    observerSince: bigint("observer_since", { mode: "number" }).notNull().default(0),
    globalNickname: varchar("global_nickname", { length: 40 }).default(sql`null`),
});

export const guilds = mysqlTable("guilds", {
    id: varchar("id", { length: 20 }).primaryKey(),
    mascot: varchar("mascot", { length: 32 })
        .references(() => characters.id, { onDelete: "cascade", onUpdate: "cascade" })
        .notNull(),
    name: text("name").notNull(),
    invite: text("invite").notNull(),
    image: text("image").notNull(),
    owner: varchar("owner", { length: 20 }).notNull(),
    advisor: varchar("advisor", { length: 20 }),
    delegated: boolean("delegated").notNull(),
});

export const guildStaff = mysqlTable(
    "guild_staff",
    {
        guild: varchar("guild", { length: 20 })
            .references(() => guilds.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        user: varchar("user", { length: 20 }).notNull(),
    },
    (t) => ({
        pk_guild_user: primaryKey({ columns: [t.guild, t.user] }),
    }),
);

export const characters = mysqlTable("characters", {
    id: varchar("id", { length: 32 }).primaryKey(),
    short: varchar("short", { length: 32 }),
    name: varchar("name", { length: 64 }).notNull(),
    element: varchar("element", { length: 32 }).notNull(),
});

export const applications = mysqlTable("applications", {
    thread: varchar("thread", { length: 20 }).primaryKey(),
    guild: varchar("guild", { length: 20 }).notNull(),
    invite: text("invite").notNull(),
    url: varchar("url", { length: 128 }).notNull(),
    user: varchar("user", { length: 20 }).notNull(),
    name: text("name").notNull(),
    experience: varchar("experience", { length: 1024 }).notNull(),
    goals: varchar("goals", { length: 1024 }).notNull(),
    history: varchar("history", { length: 1024 }).notNull(),
    additional: varchar("additional", { length: 1024 }).notNull(),
});

export const polls = mysqlTable("polls", {
    id: int("id").autoincrement().primaryKey(),
    type: mysqlEnum("type", ["decline-observation"]).notNull(),
    message: varchar("message", { length: 20 }).notNull(),
    reminder: bigint("reminder", { mode: "number" }),
    deadline: bigint("deadline", { mode: "number" }).notNull(),
    closed: boolean("closed").notNull(),
    trulyClosed: boolean("truly_closed").notNull(),
});

export const voteTracker = mysqlTable(
    "vote_tracker",
    {
        poll: int("poll")
            .references(() => polls.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        user: varchar("user", { length: 20 }).notNull(),
    },
    (t) => ({
        pk_poll_user: primaryKey({ columns: [t.poll, t.user] }),
    }),
);

export const applicationPolls = mysqlTable("application_polls", {
    ref: int("ref")
        .references(() => polls.id, { onDelete: "cascade", onUpdate: "cascade" })
        .primaryKey(),
    thread: varchar("thread", { length: 20 })
        .references(() => applications.thread, { onDelete: "cascade", onUpdate: "cascade" })
        .notNull(),
});

export const declineObservationVotes = mysqlTable(
    "decline_observation_votes",
    {
        ref: int("ref")
            .references(() => polls.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        user: varchar("user", { length: 20 }).notNull(),
        vote: mysqlEnum("vote", ["decline", "proceed", "abstain"]).notNull(),
    },
    (t) => ({
        pk_ref_user: primaryKey({ columns: [t.ref, t.user] }),
    }),
);
