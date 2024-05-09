CREATE TABLE `ban_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ref` int NOT NULL,
	`guild` varchar(20) NOT NULL,
	`user` varchar(20) NOT NULL,
	`status` enum('pending','skipped','banned','failed') NOT NULL,
	`member` boolean,
	CONSTRAINT `ban_tasks_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_ref_guild_user` UNIQUE(`ref`,`guild`,`user`)
);
--> statement-breakpoint
ALTER TABLE `ban_tasks` ADD CONSTRAINT `ban_tasks_ref_banshares_id_fk` FOREIGN KEY (`ref`) REFERENCES `banshares`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `ban_tasks` ADD CONSTRAINT `ban_tasks_guild_guilds_id_fk` FOREIGN KEY (`guild`) REFERENCES `guilds`(`id`) ON DELETE cascade ON UPDATE cascade;