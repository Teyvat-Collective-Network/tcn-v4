CREATE TABLE `banshare_log_channels` (
	`guild` varchar(20) NOT NULL,
	`channel` varchar(20) NOT NULL,
	CONSTRAINT `unq_guild_channel` UNIQUE(`guild`,`channel`)
);
--> statement-breakpoint
ALTER TABLE `banshare_crossposts` ADD `executor` varchar(20);--> statement-breakpoint
ALTER TABLE `banshare_crossposts` DROP COLUMN `executed`;--> statement-breakpoint
ALTER TABLE `banshare_log_channels` ADD CONSTRAINT `banshare_log_channels_guild_guilds_id_fk` FOREIGN KEY (`guild`) REFERENCES `guilds`(`id`) ON DELETE cascade ON UPDATE cascade;