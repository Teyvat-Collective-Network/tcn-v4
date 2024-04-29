CREATE TABLE `rescinded_banshare_log_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guild` varchar(20) NOT NULL,
	`message` varchar(20) NOT NULL,
	CONSTRAINT `rescinded_banshare_log_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `banshare_crossposts` MODIFY COLUMN `channel` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `banshare_crossposts` MODIFY COLUMN `location` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `rescinded_banshare_log_tasks` ADD CONSTRAINT `rescinded_banshare_log_tasks_guild_guilds_id_fk` FOREIGN KEY (`guild`) REFERENCES `guilds`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `rescinded_banshare_log_tasks` ADD CONSTRAINT `rescinded_banshare_log_tasks_message_banshares_message_fk` FOREIGN KEY (`message`) REFERENCES `banshares`(`message`) ON DELETE cascade ON UPDATE cascade;