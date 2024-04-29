import { mysqlTable, mysqlSchema, AnyMySqlColumn, primaryKey, varchar, index, int, tinyint, mysqlEnum, text, foreignKey, json, bigint, unique } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"


export const attributes = mysqlTable("attributes", {
	type: varchar("type", { length: 32 }).notNull(),
	id: varchar("id", { length: 32 }).notNull(),
	emoji: varchar("emoji", { length: 64 }).notNull(),
	name: varchar("name", { length: 32 }).notNull(),
},
(table) => {
	return {
		attributesTypeId: primaryKey({ columns: [table.type, table.id], name: "attributes_type_id"}),
	}
});

export const banTasks = mysqlTable("ban_tasks", {
	id: int("id").autoincrement().notNull(),
	guild: varchar("guild", { length: 20 }).notNull(),
	user: varchar("user", { length: 20 }).notNull(),
	member: tinyint("member"),
	done: tinyint("done").notNull(),
	message: varchar("message", { length: 20 }).notNull(),
	status: mysqlEnum("status", ['pending','banned','skipped','errored']),
},
(table) => {
	return {
		idxGuildMessage: index("idx_guild_message").on(table.guild, table.message),
		banTasksId: primaryKey({ columns: [table.id], name: "ban_tasks_id"}),
	}
});

export const banlists = mysqlTable("banlists", {
	key: varchar("key", { length: 36 }).notNull(),
	content: text("content"),
},
(table) => {
	return {
		banlistsKey: primaryKey({ columns: [table.key], name: "banlists_key"}),
	}
});

export const banshareCrossposts = mysqlTable("banshare_crossposts", {
	message: varchar("message", { length: 20 }).notNull(),
	guild: varchar("guild", { length: 20 }).notNull().references(() => guilds.id),
	executed: tinyint("executed").notNull(),
	channel: varchar("channel", { length: 20 }),
	location: varchar("location", { length: 20 }),
},
(table) => {
	return {
		banshareCrosspostsMessageGuild: primaryKey({ columns: [table.message, table.guild], name: "banshare_crossposts_message_guild"}),
	}
});

export const banshareIds = mysqlTable("banshare_ids", {
	message: varchar("message", { length: 20 }).notNull().references(() => banshares.message, { onDelete: "cascade", onUpdate: "cascade" } ),
	user: varchar("user", { length: 20 }).notNull(),
},
(table) => {
	return {
		banshareIdsMessageUser: primaryKey({ columns: [table.message, table.user], name: "banshare_ids_message_user"}),
	}
});

export const banshareSettings = mysqlTable("banshare_settings", {
	guild: varchar("guild", { length: 20 }).notNull(),
	channel: varchar("channel", { length: 20 }),
	autoban: json("autoban").default('{}').notNull(),
},
(table) => {
	return {
		banshareSettingsGuild: primaryKey({ columns: [table.guild], name: "banshare_settings_guild"}),
	}
});

export const banshares = mysqlTable("banshares", {
	message: varchar("message", { length: 20 }).notNull(),
	author: varchar("author", { length: 20 }).notNull(),
	reason: varchar("reason", { length: 498 }).notNull(),
	evidence: varchar("evidence", { length: 1000 }).notNull(),
	guild: varchar("guild", { length: 20 }).notNull(),
	severity: varchar("severity", { length: 8 }).notNull(),
	status: mysqlEnum("status", ['pending','published','rejected','rescinded']).notNull(),
	urgent: tinyint("urgent").notNull(),
	created: bigint("created", { mode: "number" }).notNull(),
	reminded: bigint("reminded", { mode: "number" }).notNull(),
	locked: tinyint("locked").notNull(),
	idDisplay: varchar("id_display", { length: 1024 }).notNull(),
	usernameDisplay: varchar("username_display", { length: 1024 }),
},
(table) => {
	return {
		bansharesMessage: primaryKey({ columns: [table.message], name: "banshares_message"}),
	}
});

export const characterAttributes = mysqlTable("character_attributes", {
	character: varchar("character", { length: 32 }).notNull().references(() => characters.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	type: varchar("type", { length: 32 }).notNull(),
	id: varchar("id", { length: 32 }).notNull(),
},
(table) => {
	return {
		fkAttribute: foreignKey({
			columns: [table.type, table.id],
			foreignColumns: [attributes.type, attributes.id],
			name: "fk_attribute"
		}).onUpdate("cascade").onDelete("cascade"),
		characterAttributesCharacterTypeIdUnique: unique("character_attributes_character_type_id_unique").on(table.character, table.type, table.id),
	}
});

export const characters = mysqlTable("characters", {
	id: varchar("id", { length: 32 }).notNull(),
	name: varchar("name", { length: 32 }).notNull(),
	short: varchar("short", { length: 32 }),
},
(table) => {
	return {
		charactersId: primaryKey({ columns: [table.id], name: "characters_id"}),
	}
});

export const globalBans = mysqlTable("global_bans", {
	channel: int("channel").notNull().references(() => globalChannels.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	user: varchar("user", { length: 20 }).notNull(),
	until: bigint("until", { mode: "number" }),
},
(table) => {
	return {
		globalBansChannelUser: primaryKey({ columns: [table.channel, table.user], name: "global_bans_channel_user"}),
	}
});

export const globalChannels = mysqlTable("global_channels", {
	id: int("id").autoincrement().notNull(),
	name: varchar("name", { length: 64 }).notNull(),
	public: tinyint("public").notNull(),
	logs: varchar("logs", { length: 20 }).notNull(),
},
(table) => {
	return {
		globalChannelsId: primaryKey({ columns: [table.id], name: "global_channels_id"}),
	}
});

export const globalFilter = mysqlTable("global_filter", {
	channel: int("channel").notNull().references(() => globalChannels.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	match: varchar("match", { length: 256 }).notNull(),
	user: varchar("user", { length: 20 }).notNull(),
	created: bigint("created", { mode: "number" }).notNull(),
},
(table) => {
	return {
		globalFilterChannelMatch: primaryKey({ columns: [table.channel, table.match], name: "global_filter_channel_match"}),
	}
});

export const globalMods = mysqlTable("global_mods", {
	channel: int("channel").notNull().references(() => globalChannels.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	user: varchar("user", { length: 20 }).notNull(),
},
(table) => {
	return {
		globalModsChannelUser: primaryKey({ columns: [table.channel, table.user], name: "global_mods_channel_user"}),
	}
});

export const globalPlugins = mysqlTable("global_plugins", {
	channel: int("channel").notNull().references(() => globalChannels.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	plugin: varchar("plugin", { length: 20 }).notNull(),
},
(table) => {
	return {
		globalPluginsChannelPlugin: primaryKey({ columns: [table.channel, table.plugin], name: "global_plugins_channel_plugin"}),
	}
});

export const guildStaff = mysqlTable("guild_staff", {
	guild: varchar("guild", { length: 20 }).notNull().references(() => guilds.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	user: varchar("user", { length: 20 }).notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
},
(table) => {
	return {
		guildStaffGuildUser: primaryKey({ columns: [table.guild, table.user], name: "guild_staff_guild_user"}),
	}
});

export const guilds = mysqlTable("guilds", {
	id: varchar("id", { length: 20 }).notNull(),
	invite: varchar("invite", { length: 16 }).notNull(),
	name: varchar("name", { length: 64 }).notNull(),
	owner: varchar("owner", { length: 20 }).notNull(),
	advisor: varchar("advisor", { length: 20 }),
	delegated: tinyint("delegated").notNull(),
	image: text("image").notNull(),
	mascot: varchar("mascot", { length: 32 }).notNull().references(() => characters.id, { onDelete: "restrict", onUpdate: "restrict" } ),
},
(table) => {
	return {
		guildsId: primaryKey({ columns: [table.id], name: "guilds_id"}),
	}
});

export const pendingBanshareCrossposts = mysqlTable("pending_banshare_crossposts", {
	id: int("id").autoincrement().notNull(),
	message: varchar("message", { length: 20 }).notNull().references(() => banshares.message, { onDelete: "cascade", onUpdate: "cascade" } ),
	guild: varchar("guild", { length: 20 }).notNull(),
},
(table) => {
	return {
		guildBanshareSettingsGuildFk: index("pending_banshare_crossposts_guild_banshare_settings_guild_fk").on(table.guild),
		pendingBanshareCrosspostsId: primaryKey({ columns: [table.id], name: "pending_banshare_crossposts_id"}),
	}
});

export const users = mysqlTable("users", {
	id: varchar("id", { length: 20 }).notNull(),
	observer: tinyint("observer").notNull(),
	staff: tinyint("staff").notNull(),
	owner: tinyint("owner").notNull(),
	advisor: tinyint("advisor").notNull(),
	observerSince: bigint("observer_since", { mode: "number" }).notNull(),
	globalNickname: varchar("global_nickname", { length: 40 }),
	globalMod: tinyint("global_mod").notNull(),
},
(table) => {
	return {
		usersId: primaryKey({ columns: [table.id], name: "users_id"}),
	}
});