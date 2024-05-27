import { sql } from "drizzle-orm";
import { bigint, boolean, index, int, json, mysqlEnum, mysqlTable, primaryKey, text, unique, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
    id: varchar("id", { length: 20 }).primaryKey(),
    observer: boolean("observer").notNull().default(false),
    observerSince: bigint("observer_since", { mode: "number" }).notNull().default(0),
    globalNickname: varchar("global_nickname", { length: 40 }).default(sql`null`),
    reportsQuizPassed: boolean("reports_quiz_passed").notNull().default(false),
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
    roleColor: int("role_color").notNull(),
    roleName: varchar("role_name", { length: 80 }).notNull(),
    hqRole: varchar("hq_role", { length: 20 }).notNull(),
    hubRole: varchar("hub_role", { length: 20 }).notNull(),
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

export const forcedStaff = mysqlTable(
    "forced_staff",
    {
        guild: varchar("guild", { length: 20 })
            .references(() => guilds.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        user: varchar("user", { length: 20 }).notNull(),
        staff: boolean("staff").notNull(),
    },
    (t) => ({
        pk_guild_user: primaryKey({ columns: [t.guild, t.user] }),
    }),
);

export const autoStaffRoles = mysqlTable(
    "auto_staff_roles",
    {
        guild: varchar("guild", { length: 20 })
            .references(() => guilds.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        role: varchar("role", { length: 20 }).notNull(),
    },
    (t) => ({
        pk_guild_role: primaryKey({ columns: [t.guild, t.role] }),
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
    type: mysqlEnum("type", ["decline-observation", "cancel-observation", "induction", "election", "proposal", "selection"]).notNull(),
    message: varchar("message", { length: 20 }).notNull(),
    reminder: bigint("reminder", { mode: "number" }),
    deadline: bigint("deadline", { mode: "number" }).notNull(),
    closed: boolean("closed").notNull(),
    trulyClosed: boolean("truly_closed").notNull(),
    errored: boolean("errored").notNull().default(false),
});

export const expectedVoters = mysqlTable(
    "expected_voters",
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

export const proposalPolls = mysqlTable("proposal_polls", {
    ref: int("ref")
        .references(() => polls.id, { onDelete: "cascade", onUpdate: "cascade" })
        .primaryKey(),
    question: varchar("question", { length: 1024 }).notNull(),
});

export const selectionPolls = mysqlTable("selection_polls", {
    ref: int("ref")
        .references(() => polls.id, { onDelete: "cascade", onUpdate: "cascade" })
        .primaryKey(),
    question: varchar("question", { length: 1024 }).notNull(),
    options: json("options").notNull(),
    minimum: int("minimum").notNull(),
    maximum: int("maximum").notNull(),
});

export const applicationPolls = mysqlTable("application_polls", {
    ref: int("ref")
        .references(() => polls.id, { onDelete: "cascade", onUpdate: "cascade" })
        .primaryKey(),
    thread: varchar("thread", { length: 20 })
        .references(() => applications.thread, { onDelete: "cascade", onUpdate: "cascade" })
        .notNull(),
});

export const inductionPolls = mysqlTable("induction_polls", {
    ref: int("ref")
        .references(() => polls.id, { onDelete: "cascade", onUpdate: "cascade" })
        .primaryKey(),
    mode: mysqlEnum("mode", ["normal", "pre-approve", "positive-tiebreak", "negative-tiebreak"]).notNull(),
});

export const proposalVotes = mysqlTable(
    "proposal_votes",
    {
        ref: int("ref")
            .references(() => polls.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        user: varchar("user", { length: 20 }).notNull(),
        vote: mysqlEnum("vote", ["accept", "reject", "abstain"]).notNull(),
    },
    (t) => ({
        pk_ref_user: primaryKey({ columns: [t.ref, t.user] }),
    }),
);

export const selectionVotes = mysqlTable(
    "selection_votes",
    {
        ref: int("ref")
            .references(() => polls.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        user: varchar("user", { length: 20 }).notNull(),
        vote: json("vote").notNull(),
    },
    (t) => ({
        pk_ref_user: primaryKey({ columns: [t.ref, t.user] }),
    }),
);

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

export const cancelObservationVotes = mysqlTable(
    "cancel_observation_votes",
    {
        ref: int("ref")
            .references(() => polls.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        user: varchar("user", { length: 20 }).notNull(),
        vote: mysqlEnum("vote", ["cancel", "continue", "abstain"]).notNull(),
    },
    (t) => ({
        pk_ref_user: primaryKey({ columns: [t.ref, t.user] }),
    }),
);

export const inductionVotes = mysqlTable(
    "induction_votes",
    {
        ref: int("ref")
            .references(() => polls.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        user: varchar("user", { length: 20 }).notNull(),
        vote: mysqlEnum("vote", ["induct", "preapprove", "reject", "extend", "abstain"]).notNull(),
    },
    (t) => ({ pk_ref_user: primaryKey({ columns: [t.ref, t.user] }) }),
);

export const txts = mysqlTable("txts", {
    uuid: varchar("uuid", { length: 36 }).primaryKey(),
    content: text("content").notNull(),
});

export const networkUserReports = mysqlTable(
    "network_user_reports",
    {
        id: int("id").autoincrement().primaryKey(),
        message: varchar("message", { length: 20 }).notNull(),
        author: varchar("author", { length: 20 }).notNull(),
        display: varchar("display", { length: 1024 }).notNull(),
        usernames: varchar("usernames", { length: 1024 }).notNull(),
        reason: varchar("reason", { length: 480 }).notNull(),
        evidence: varchar("evidence", { length: 1000 }).notNull(),
        server: varchar("server", { length: 20 }).notNull(),
        category: mysqlEnum("category", ["banshare", "advisory", "hacked"]).notNull(),
        urgent: boolean("urgent").notNull(),
        created: bigint("created", { mode: "number" }).notNull(),
        reminded: bigint("reminded", { mode: "number" }).notNull(),
        status: mysqlEnum("status", ["pending", "locked", "rejected", "published", "rescinded"]).notNull(),
    },
    (t) => ({
        idx_message: index("idx_message").on(t.message),
    }),
);

export const reportIds = mysqlTable(
    "report_ids",
    {
        ref: int("ref")
            .references(() => networkUserReports.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        user: varchar("user", { length: 20 }).notNull(),
    },
    (t) => ({ pk_ref_user: primaryKey({ columns: [t.ref, t.user] }) }),
);

export const reportSettings = mysqlTable("report_settings", {
    guild: varchar("guild", { length: 20 })
        .references(() => guilds.id, { onDelete: "cascade", onUpdate: "cascade" })
        .primaryKey(),
    channel: varchar("channel", { length: 20 }),
    logs: varchar("logs", { length: 20 }),
    autoban: boolean("autoban").notNull().default(false),
    autokick: boolean("autokick").notNull().default(false),
    autobanMemberThreshold: bigint("autoban_member_threshold", { mode: "number" }).notNull().default(0),
    receiveBanshare: boolean("receive_banshare").notNull().default(true),
    receiveAdvisory: boolean("receive_advisory").notNull().default(true),
    receiveHacked: boolean("receive_hacked").notNull().default(true),
});

export const reportCrossposts = mysqlTable(
    "report_crossposts",
    {
        ref: int("ref")
            .references(() => networkUserReports.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        guild: varchar("guild", { length: 20 })
            .references(() => guilds.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        channel: varchar("channel", { length: 20 }).notNull(),
        message: varchar("message", { length: 20 }).notNull(),
        executor: varchar("executor", { length: 20 }),
    },
    (t) => ({
        pk_ref_guild: primaryKey({ columns: [t.ref, t.guild] }),
    }),
);

export const reportHubPosts = mysqlTable("report_hub_posts", {
    ref: int("ref")
        .references(() => networkUserReports.id, { onDelete: "cascade", onUpdate: "cascade" })
        .primaryKey(),
    channel: varchar("channel", { length: 20 }).notNull(),
    message: varchar("message", { length: 20 }).notNull(),
});

export const reportTasks = mysqlTable(
    "report_tasks",
    {
        id: int("id").autoincrement().primaryKey(),
        ref: int("ref")
            .references(() => networkUserReports.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        guild: varchar("guild", { length: 20 })
            .references(() => guilds.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        user: varchar("user", { length: 20 }).notNull(),
        status: mysqlEnum("status", ["pending", "skipped", "success", "failed", "hold"]).notNull(),
        auto: boolean("auto").notNull(),
    },
    (t) => ({
        unq_ref_guild_user: unique("idx_ref_guild_user").on(t.ref, t.guild, t.user),
    }),
);

export const auditLogs = mysqlTable(
    "audit_logs",
    {
        id: int("id").autoincrement().primaryKey(),
        time: bigint("time", { mode: "number" }).notNull(),
        actor: varchar("actor", { length: 20 }).notNull(),
        type: varchar("type", { length: 64 }).notNull(),
        guild: varchar("guild", { length: 20 }),
        data: json("data"),
    },
    (t) => ({
        idx_actor_guild_type: index("idx_actor_guild_type").on(t.actor, t.guild, t.type),
        idx_guild_type: index("idx_guild_type").on(t.guild, t.type),
        idx_type: index("idx_type").on(t.type),
    }),
);

export const auditEntryTargets = mysqlTable(
    "audit_entry_targets",
    {
        target: varchar("target", { length: 20 }).notNull(),
        ref: int("ref")
            .references(() => auditLogs.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
    },
    (t) => ({
        idx_target: index("idx_target").on(t.target),
    }),
);

export const elections = mysqlTable(
    "elections",
    {
        wave: int("wave").primaryKey(),
        channel: varchar("channel", { length: 20 }).notNull(),
        seats: int("seats").notNull(),
    },
    (t) => ({
        idx_channel: index("idx_channel").on(t.channel),
    }),
);

export const electionStatements = mysqlTable(
    "election_statements",
    {
        wave: int("wave")
            .references(() => elections.wave, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        user: varchar("user", { length: 20 }).notNull(),
        message: varchar("message", { length: 20 }).notNull(),
    },
    (t) => ({
        pk_wave_user: primaryKey({ columns: [t.wave, t.user] }),
    }),
);

export const electionHistory = mysqlTable(
    "election_history",
    {
        wave: int("wave")
            .references(() => elections.wave, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        user: varchar("user", { length: 20 }).notNull(),
        status: mysqlEnum("status", ["nominated", "accepted", "declined", "elected", "tied", "runner-up"]).notNull(),
        rerunning: boolean("rerunning").notNull(),
    },
    (t) => ({
        pk_wave_user: primaryKey({ columns: [t.wave, t.user] }),
    }),
);

export const electionPolls = mysqlTable(
    "election_polls",
    {
        ref: int("ref")
            .references(() => polls.id, { onDelete: "cascade", onUpdate: "cascade" })
            .primaryKey(),
        thread: varchar("thread", { length: 20 })
            .references(() => elections.channel, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        candidates: json("candidates").notNull(),
        autopromoted: boolean("autopromoted").notNull().default(false),
    },
    (t) => ({
        idx_thread: index("idx_thread").on(t.thread),
    }),
);

export const electionVotes = mysqlTable(
    "election_votes",
    {
        ref: int("ref")
            .references(() => polls.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        user: varchar("user", { length: 20 }).notNull(),
        vote: json("vote").notNull(),
    },
    (t) => ({
        pk_ref_user: primaryKey({ columns: [t.ref, t.user] }),
    }),
);

export const autosyncSettings = mysqlTable("autosync_settings", {
    guild: varchar("guild", { length: 20 })
        .references(() => guilds.id, { onDelete: "cascade", onUpdate: "cascade" })
        .primaryKey(),
    location: mysqlEnum("location", ["disabled", "channel", "webhook"]).notNull(),
    channel: varchar("channel", { length: 20 }),
    webhook: text("webhook"),
    message: varchar("message", { length: 20 }),
    repost: boolean("repost").notNull().default(false),
});

export const hqPartnerListLocation = mysqlTable("hq_partner_list_location", {
    id: int("id").primaryKey(),
    message: varchar("message", { length: 20 }).notNull(),
});

export const hubPartnerListLocation = mysqlTable("hub_partner_list_location", {
    id: int("id").primaryKey(),
    message: varchar("message", { length: 20 }).notNull(),
});

export const globalChannels = mysqlTable("global_channels", {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
    visible: boolean("visible").notNull(),
    password: varchar("password", { length: 128 }),
    panic: boolean("panic").notNull().default(false),
    protected: boolean("protected").notNull().default(false),
    important: boolean("important").notNull().default(false),
    infoOnUserPlugin: boolean("info_on_user_plugin").notNull().default(false),
    logs: varchar("logs", { length: 20 }),
});

export const globalConnections = mysqlTable(
    "global_connections",
    {
        channel: int("channel")
            .references(() => globalChannels.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        guild: varchar("guild", { length: 20 }).notNull(),
        location: varchar("location", { length: 20 }).primaryKey(),
    },
    (t) => ({
        unq_channel_guild: unique("unq_channel_guild").on(t.channel, t.guild),
    }),
);

export const globalFilters = mysqlTable("global_filters", {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
});

export const globalFilterTerms = mysqlTable(
    "global_filter_terms",
    {
        id: int("id").autoincrement().primaryKey(),
        filter: int("filter")
            .references(() => globalFilters.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        term: text("term").notNull(),
        regex: boolean("regex").notNull(),
    },
    (t) => ({
        idx_filter: index("idx_filter").on(t.filter),
    }),
);

export const globalAppliedFilters = mysqlTable(
    "global_applied_filters",
    {
        channel: int("channel")
            .references(() => globalChannels.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        filter: int("filter")
            .references(() => globalFilters.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
    },
    (t) => ({
        pk_channel_filter: primaryKey({ columns: [t.channel, t.filter] }),
    }),
);

export const globalMods = mysqlTable(
    "global_mods",
    {
        channel: int("channel")
            .references(() => globalChannels.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        user: varchar("user", { length: 20 }).notNull(),
    },
    (t) => ({
        pk_channel_user: primaryKey({ columns: [t.channel, t.user] }),
    }),
);

export const globalBans = mysqlTable(
    "global_bans",
    {
        channel: int("channel")
            .references(() => globalChannels.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        user: varchar("user", { length: 20 }).notNull(),
    },
    (t) => ({
        pk_channel_user: primaryKey({ columns: [t.channel, t.user] }),
    }),
);

export const globalMessages = mysqlTable(
    "global_messages",
    {
        id: int("id").autoincrement().primaryKey(),
        channel: int("channel")
            .references(() => globalChannels.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        author: varchar("author", { length: 20 }).notNull(),
        replyTo: int("reply_to"),
        originGuild: varchar("origin_guild", { length: 20 }).notNull(),
        originChannel: varchar("origin_channel", { length: 20 }).notNull(),
        originMessage: varchar("origin_message", { length: 20 }).notNull(),
        deleted: boolean("deleted").notNull().default(false),
        time: bigint("time", { mode: "number" }).notNull(),
        content: text("content").notNull(),
        embeds: json("embeds"),
        attachments: json("attachments"),
        username: varchar("username", { length: 80 }).notNull(),
        replyUsername: varchar("reply_username", { length: 80 }).notNull(),
        avatar: text("avatar").notNull(),
    },
    (t) => ({
        idx_author: index("idx_author").on(t.author),
    }),
);

export const globalMessageInstances = mysqlTable(
    "global_message_instances",
    {
        ref: int("ref")
            .references(() => globalMessages.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        guild: varchar("guild", { length: 20 }).notNull(),
        channel: varchar("channel", { length: 20 }).notNull(),
        message: varchar("message", { length: 20 }).notNull(),
    },
    (t) => ({
        idx_message: index("idx_message").on(t.message),
    }),
);

export const auxGlobalAuthors = mysqlTable("aux_global_authors", {
    message: varchar("message", { length: 20 }).primaryKey(),
    user: varchar("user", { length: 20 }).notNull(),
});

export const globalWebhookTracker = mysqlTable("global_webhook_tracker", {
    webhook: varchar("webhook", { length: 20 }).primaryKey(),
});

export const globalModLogs = mysqlTable("global_mod_logs", {
    user: varchar("user", { length: 20 }).notNull(),
    actor: varchar("actor", { length: 20 }).notNull(),
    action: mysqlEnum("action", ["warn", "ban", "unban"]).notNull(),
    reason: varchar("reason", { length: 256 }),
});

export const globalInfoOnUserRequestInstances = mysqlTable(
    "global_info_on_user_request_instances",
    {
        ref: int("ref")
            .references(() => globalMessages.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        guild: varchar("guild", { length: 20 }).notNull(),
        channel: varchar("channel", { length: 20 }).notNull(),
        message: varchar("message", { length: 20 }).primaryKey(),
    },
    (t) => ({
        idx_ref: index("idx_ref").on(t.ref),
    }),
);

export const globalInfoRequestGuilds = mysqlTable(
    "global_info_request_guilds",
    {
        ref: int("ref")
            .references(() => globalMessages.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        guild: varchar("guild", { length: 20 }).notNull(),
        name: text("name").notNull(),
    },
    (t) => ({
        pk_ref_guild: primaryKey({ columns: [t.ref, t.guild] }),
    }),
);

export const files = mysqlTable("files", {
    uuid: varchar("uuid", { length: 36 }).primaryKey(),
    channel: varchar("channel", { length: 20 }).notNull(),
    message: varchar("message", { length: 20 }).notNull(),
});
