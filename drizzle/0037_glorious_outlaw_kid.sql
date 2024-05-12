CREATE TABLE `autosync_settings` (
	`guild` varchar(20) NOT NULL,
	`location` enum('disabled','channel','webhook') NOT NULL,
	`channel` varchar(20),
	`webhook` text,
	`message` varchar(20),
	`repost` boolean NOT NULL DEFAULT false,
	CONSTRAINT `autosync_settings_guild` PRIMARY KEY(`guild`)
);
--> statement-breakpoint
CREATE TABLE `hub_partner_list_location` (
	`id` int NOT NULL,
	`message` varchar(20) NOT NULL,
	CONSTRAINT `hub_partner_list_location_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `autosync_settings` ADD CONSTRAINT `autosync_settings_guild_guilds_id_fk` FOREIGN KEY (`guild`) REFERENCES `guilds`(`id`) ON DELETE cascade ON UPDATE cascade;