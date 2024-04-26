import { bigint, boolean, foreignKey, int, mysqlTable, primaryKey, text, unique, varchar } from "drizzle-orm/mysql-core";

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
    mascot: varchar("id", { length: 20 })
        .references(() => characters.id, {
            onDelete: "restrict",
            onUpdate: "restrict",
        })
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
            .references(() => guilds.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            })
            .notNull(),
        user: varchar("user", { length: 20 })
            .references(() => users.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            })
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
    id: varchar("id", { length: 20 }).primaryKey(),
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
        character: varchar("character", { length: 20 })
            .references(() => characters.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            })
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
            .references(() => globalChannels.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            })
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
            .references(() => globalChannels.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            })
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
            .references(() => globalChannels.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            })
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
            .references(() => globalChannels.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            })
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
