import { mysqlTable, mysqlSchema, AnyMySqlColumn, primaryKey, varchar, unique, int, bigint, tinyint } from "drizzle-orm/mysql-core"
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

export const characterAttributes = mysqlTable("character_attributes", {
	character: varchar("character", { length: 20 }).notNull(),
	type: varchar("type", { length: 32 }).notNull(),
	id: varchar("id", { length: 32 }).notNull(),
},
(table) => {
	return {
		characterAttributesCharacterTypeIdUnique: unique("character_attributes_character_type_id_unique").on(table.character, table.type, table.id),
	}
});

export const characters = mysqlTable("characters", {
	id: varchar("id", { length: 20 }).notNull(),
	name: varchar("name", { length: 32 }).notNull(),
	short: varchar("short", { length: 32 }),
},
(table) => {
	return {
		charactersId: primaryKey({ columns: [table.id], name: "characters_id"}),
	}
});

export const globalBans = mysqlTable("global_bans", {
	channel: int("channel").notNull(),
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