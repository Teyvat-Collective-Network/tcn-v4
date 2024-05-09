CREATE TABLE `banshare_action_settings` (
	`guild` varchar(20) NOT NULL,
	`severity` varchar(8) NOT NULL,
	`member` boolean NOT NULL,
	`action` enum('nothing','timeout','kick','ban') NOT NULL,
	CONSTRAINT `banshare_action_settings_guild_severity_member_pk` PRIMARY KEY(`guild`,`severity`,`member`)
);
--> statement-breakpoint
CREATE TABLE `banshare_settings` (
	`guild` varchar(20) NOT NULL,
	`channel` varchar(20),
	`logs` varchar(20),
	CONSTRAINT `banshare_settings_guild` PRIMARY KEY(`guild`)
);
--> statement-breakpoint
ALTER TABLE `banshare_action_settings` ADD CONSTRAINT `banshare_action_settings_guild_guilds_id_fk` FOREIGN KEY (`guild`) REFERENCES `guilds`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `banshare_settings` ADD CONSTRAINT `banshare_settings_guild_guilds_id_fk` FOREIGN KEY (`guild`) REFERENCES `guilds`(`id`) ON DELETE cascade ON UPDATE cascade;