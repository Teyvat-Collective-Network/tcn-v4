import { bigint, boolean, foreignKey, index, int, json, mysqlEnum, mysqlTable, primaryKey, text, unique, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
    id: varchar("id", { length: 20 }).primaryKey(),
    observer: boolean("observer").notNull(),
    staff: boolean("staff").notNull(),
    globalMod: boolean("global_mod").notNull(),
    owner: boolean("owner").notNull(),
    advisor: boolean("advisor").notNull(),
    observerSince: bigint("observer_since", { mode: "number" }).notNull(),
    globalNickname: varchar("global_nickname", { length: 40 }),
});

export const guilds = mysqlTable("guilds", {
    id: varchar("id", { length: 20 }).primaryKey(),
    mascot: varchar("mascot", { length: 32 })
        .references(() => characters.id, { onDelete: "restrict", onUpdate: "restrict" })
        .notNull(),
    invite: varchar("invite", { length: 16 }).notNull(),
    image: text("image").notNull(),
    name: varchar("name", { length: 64 }).notNull(),
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
        user: varchar("user", { length: 20 })
            .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
    },
    (t) => ({
        pk_guild_user: primaryKey({
            name: "pk_guild_user",
            columns: [t.guild, t.user],
        }),
    }),
);

export const characters = mysqlTable("characters", {
    id: varchar("id", { length: 32 }).primaryKey(),
    name: varchar("name", { length: 32 }).notNull(),
    short: varchar("short", { length: 32 }),
});

export const attributes = mysqlTable(
    "attributes",
    {
        type: varchar("type", { length: 32 }).notNull(),
        id: varchar("id", { length: 32 }).notNull(),
        emoji: varchar("emoji", { length: 64 }).notNull(),
        name: varchar("name", { length: 32 }).notNull(),
    },
    (t) => ({
        pk_type_id: primaryKey({ name: "pk_type_id", columns: [t.type, t.id] }),
    }),
);

export const characterAttributes = mysqlTable(
    "character_attributes",
    {
        character: varchar("character", { length: 32 })
            .references(() => characters.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        type: varchar("type", { length: 32 }).notNull(),
        id: varchar("id", { length: 32 }).notNull(),
    },
    (t) => ({
        fk_attribute: foreignKey({
            name: "fk_attribute",
            columns: [t.type, t.id],
            foreignColumns: [attributes.type, attributes.id],
        })
            .onDelete("cascade")
            .onUpdate("cascade"),
        unq_character_type_id: unique().on(t.character, t.type, t.id),
    }),
);

export const globalChannels = mysqlTable("global_channels", {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 64 }).notNull(),
    public: boolean("public").notNull(),
    logs: varchar("logs", { length: 20 }).notNull(),
});

export const globalMods = mysqlTable(
    "global_mods",
    {
        channel: int("channel")
            .references(() => globalChannels.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        user: varchar("user", { length: 20 }).notNull(),
    },
    (t) => ({
        pk_channel_user: primaryKey({
            name: "pk_channel_user",
            columns: [t.channel, t.user],
        }),
    }),
);

export const globalBans = mysqlTable(
    "global_bans",
    {
        channel: int("channel")
            .references(() => globalChannels.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        user: varchar("user", { length: 20 }).notNull(),
        until: bigint("until", { mode: "number" }),
    },
    (t) => ({
        pk_channel_user: primaryKey({
            name: "pk_channel_user",
            columns: [t.channel, t.user],
        }),
    }),
);

export const globalPlugins = mysqlTable(
    "global_plugins",
    {
        channel: int("channel")
            .references(() => globalChannels.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        plugin: varchar("plugin", { length: 20 }).notNull(),
    },
    (t) => ({
        pk_channel_plugin: primaryKey({
            name: "pk_channel_plugin",
            columns: [t.channel, t.plugin],
        }),
    }),
);

export const globalFilter = mysqlTable(
    "global_filter",
    {
        channel: int("channel")
            .references(() => globalChannels.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        match: varchar("match", { length: 256 }).notNull(),
        user: varchar("user", { length: 20 }).notNull(),
        created: bigint("created", { mode: "number" }).notNull(),
        updated: bigint("created", { mode: "number" }).notNull(),
    },
    (t) => ({
        pk_channel_plugin: primaryKey({
            name: "pk_channel_plugin",
            columns: [t.channel, t.match],
        }),
    }),
);

export const banlists = mysqlTable("banlists", {
    key: varchar("key", { length: 36 }).primaryKey(),
    content: text("content"),
});

export const banshares = mysqlTable("banshares", {
    message: varchar("message", { length: 20 }).primaryKey(),
    hubPost: varchar("hub_post", { length: 20 }),
    author: varchar("author", { length: 20 }).notNull(),
    reason: varchar("reason", { length: 498 }).notNull(),
    evidence: varchar("evidence", { length: 1000 }).notNull(),
    guild: varchar("guild", { length: 20 }).notNull(),
    severity: varchar("severity", { length: 8 }).notNull(),
    status: mysqlEnum("status", ["pending", "published", "rejected", "rescinded"]).notNull(),
    urgent: boolean("urgent").notNull(),
    created: bigint("created", { mode: "number" }).notNull(),
    reminded: bigint("reminded", { mode: "number" }).notNull(),
    locked: boolean("locked").notNull(),
    idDisplay: varchar("id_display", { length: 1024 }).notNull(),
    usernameDisplay: varchar("username_display", { length: 1024 }),
});

export const banshareIds = mysqlTable(
    "banshare_ids",
    {
        message: varchar("message", { length: 20 })
            .references(() => banshares.message, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        user: varchar("user", { length: 20 }).notNull(),
    },
    (t) => ({
        pk_message_user: primaryKey({ name: "pk_message_user", columns: [t.message, t.user] }),
    }),
);

export const banshareSettings = mysqlTable("banshare_settings", {
    guild: varchar("guild", { length: 20 })
        .references(() => guilds.id, { onDelete: "cascade", onUpdate: "cascade" })
        .primaryKey(),
    channel: varchar("channel", { length: 20 }),
    daedalus: boolean("daedalus").notNull().default(false),
    autoban: json("autoban").notNull().default({}),
});

export const banshareLogChannels = mysqlTable(
    "banshare_log_channels",
    {
        guild: varchar("guild", { length: 20 })
            .references(() => guilds.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        channel: varchar("channel", { length: 20 }).notNull(),
    },
    (t) => ({
        unq_guild_channel: uniqueIndex("unq_guild_channel").on(t.guild, t.channel),
    }),
);

export const pendingBanshareCrossposts = mysqlTable("pending_banshare_crossposts", {
    id: int("id").autoincrement().primaryKey(),
    message: varchar("message", { length: 20 })
        .references(() => banshares.message, { onDelete: "cascade", onUpdate: "cascade" })
        .notNull(),
    guild: varchar("guild", { length: 20 })
        .references(() => banshareSettings.guild, { onDelete: "cascade", onUpdate: "cascade" })
        .notNull(),
});

export const banshareCrossposts = mysqlTable(
    "banshare_crossposts",
    {
        message: varchar("message", { length: 20 })
            .references(() => banshares.message, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        guild: varchar("guild", { length: 20 })
            .references(() => guilds.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        channel: varchar("channel", { length: 20 }).notNull(),
        location: varchar("location", { length: 20 }).notNull(),
        executor: varchar("executor", { length: 20 }),
    },
    (t) => ({
        pk_message_guild: primaryKey({ name: "pk_message_guild", columns: [t.message, t.guild] }),
    }),
);

export const banTasks = mysqlTable(
    "ban_tasks",
    {
        id: int("id").autoincrement().primaryKey(),
        guild: varchar("guild", { length: 20 })
            .references(() => guilds.id, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        message: varchar("message", { length: 20 })
            .references(() => banshares.message, { onDelete: "cascade", onUpdate: "cascade" })
            .notNull(),
        user: varchar("user", { length: 20 }).notNull(),
        member: boolean("member"),
        status: mysqlEnum("status", ["pending", "banned", "skipped", "errored"]),
    },
    (t) => ({
        idx_guild_message: index("idx_guild_message").on(t.guild, t.message),
    }),
);

export const rescindedBanshareLogTasks = mysqlTable("rescinded_banshare_log_tasks", {
    id: int("id").autoincrement().primaryKey(),
    guild: varchar("guild", { length: 20 })
        .references(() => guilds.id, { onDelete: "cascade", onUpdate: "cascade" })
        .notNull(),
    message: varchar("message", { length: 20 })
        .references(() => banshares.message, { onDelete: "cascade", onUpdate: "cascade" })
        .notNull(),
});
