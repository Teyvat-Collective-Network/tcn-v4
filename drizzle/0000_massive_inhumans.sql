CREATE TABLE `attributes` (
	`type` varchar(32) NOT NULL,
	`id` varchar(32) NOT NULL,
	`emoji` varchar(64) NOT NULL,
	`name` varchar(32) NOT NULL,
	CONSTRAINT `pk_type_id` PRIMARY KEY(`type`,`id`)
);
--> statement-breakpoint
CREATE TABLE `character_attributes` (
	`character` varchar(20) NOT NULL,
	`type` varchar(32) NOT NULL,
	`id` varchar(32) NOT NULL,
	CONSTRAINT `character_attributes_character_type_id_unique` UNIQUE(`character`,`type`,`id`)
);
--> statement-breakpoint
CREATE TABLE `characters` (
	`id` varchar(20) NOT NULL,
	`name` varchar(32) NOT NULL,
	`short` varchar(32),
	CONSTRAINT `characters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `global_bans` (
	`channel` int NOT NULL,
	`user` varchar(20) NOT NULL,
	`until` bigint,
	CONSTRAINT `pk_channel_user` PRIMARY KEY(`channel`,`user`)
);
--> statement-breakpoint
CREATE TABLE `global_channels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`public` boolean NOT NULL,
	`logs` varchar(20) NOT NULL,
	CONSTRAINT `global_channels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `global_filter` (
	`channel` int NOT NULL,
	`match` varchar(256) NOT NULL,
	`user` varchar(20) NOT NULL,
	`created` bigint NOT NULL,
	CONSTRAINT `pk_channel_plugin` PRIMARY KEY(`channel`,`match`)
);
--> statement-breakpoint
CREATE TABLE `global_mods` (
	`channel` int NOT NULL,
	`user` varchar(20) NOT NULL,
	CONSTRAINT `pk_channel_user` PRIMARY KEY(`channel`,`user`)
);
--> statement-breakpoint
CREATE TABLE `global_plugins` (
	`channel` int NOT NULL,
	`plugin` varchar(20) NOT NULL,
	CONSTRAINT `pk_channel_plugin` PRIMARY KEY(`channel`,`plugin`)
);
--> statement-breakpoint
CREATE TABLE `guild_staff` (
	`guild` varchar(20) NOT NULL,
	`user` varchar(20) NOT NULL,
	CONSTRAINT `pk_guild_user` PRIMARY KEY(`guild`,`user`)
);
--> statement-breakpoint
CREATE TABLE `guilds` (
	`id` varchar(20) NOT NULL,
	`invite` varchar(16) NOT NULL,
	`name` varchar(64) NOT NULL,
	`owner` varchar(20) NOT NULL,
	`advisor` varchar(20),
	`delegated` boolean NOT NULL,
	CONSTRAINT `guilds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(20) NOT NULL,
	`observer` boolean NOT NULL,
	`staff` boolean NOT NULL,
	`owner` boolean NOT NULL,
	`advisor` boolean NOT NULL,
	`observer_since` bigint NOT NULL,
	`global_nickname` varchar(40),
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `character_attributes` ADD CONSTRAINT `character_attributes_character_characters_id_fk` FOREIGN KEY (`character`) REFERENCES `characters`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `character_attributes` ADD CONSTRAINT `fk_attribute` FOREIGN KEY (`type`,`id`) REFERENCES `attributes`(`type`,`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_bans` ADD CONSTRAINT `global_bans_channel_global_channels_id_fk` FOREIGN KEY (`channel`) REFERENCES `global_channels`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_filter` ADD CONSTRAINT `global_filter_channel_global_channels_id_fk` FOREIGN KEY (`channel`) REFERENCES `global_channels`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_mods` ADD CONSTRAINT `global_mods_channel_global_channels_id_fk` FOREIGN KEY (`channel`) REFERENCES `global_channels`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_plugins` ADD CONSTRAINT `global_plugins_channel_global_channels_id_fk` FOREIGN KEY (`channel`) REFERENCES `global_channels`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `guild_staff` ADD CONSTRAINT `guild_staff_guild_guilds_id_fk` FOREIGN KEY (`guild`) REFERENCES `guilds`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `guild_staff` ADD CONSTRAINT `guild_staff_user_users_id_fk` FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `guilds` ADD CONSTRAINT `guilds_id_characters_id_fk` FOREIGN KEY (`id`) REFERENCES `characters`(`id`) ON DELETE restrict ON UPDATE restrict;