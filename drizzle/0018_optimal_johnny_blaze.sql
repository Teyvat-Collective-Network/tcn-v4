CREATE TABLE `ban_tasks` (
	`ref` int NOT NULL,
	`guild` varchar(20) NOT NULL,
	`user` varchar(20) NOT NULL,
	`status` enum('pending','skipped','banned','failed') NOT NULL,
	CONSTRAINT `ban_tasks_ref_guild_pk` PRIMARY KEY(`ref`,`guild`)
);
--> statement-breakpoint
ALTER TABLE `ban_tasks` ADD CONSTRAINT `ban_tasks_ref_banshares_id_fk` FOREIGN KEY (`ref`) REFERENCES `banshares`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `ban_tasks` ADD CONSTRAINT `ban_tasks_guild_guilds_id_fk` FOREIGN KEY (`guild`) REFERENCES `guilds`(`id`) ON DELETE cascade ON UPDATE cascade;