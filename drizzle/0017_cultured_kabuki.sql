CREATE TABLE `banshare_crossposts` (
	`ref` int NOT NULL,
	`guild` varchar(20) NOT NULL,
	`channel` varchar(20) NOT NULL,
	`message` varchar(20) NOT NULL,
	CONSTRAINT `banshare_crossposts_ref_guild_pk` PRIMARY KEY(`ref`,`guild`)
);
--> statement-breakpoint
ALTER TABLE `banshare_action_settings` ADD `ban` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `banshare_action_settings` DROP COLUMN `action`;--> statement-breakpoint
ALTER TABLE `banshare_crossposts` ADD CONSTRAINT `banshare_crossposts_ref_banshares_id_fk` FOREIGN KEY (`ref`) REFERENCES `banshares`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `banshare_crossposts` ADD CONSTRAINT `banshare_crossposts_guild_guilds_id_fk` FOREIGN KEY (`guild`) REFERENCES `guilds`(`id`) ON DELETE cascade ON UPDATE cascade;