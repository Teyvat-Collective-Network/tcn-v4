CREATE TABLE `decline_observation_polls` (
	`ref` int NOT NULL,
	`thread` varchar(20) NOT NULL,
	`name` text NOT NULL,
	`url` varchar(128) NOT NULL,
	CONSTRAINT `decline_observation_polls_ref` PRIMARY KEY(`ref`)
);
--> statement-breakpoint
CREATE TABLE `decline_observation_votes` (
	`ref` int NOT NULL,
	`user` varchar(20) NOT NULL,
	`vote` enum('decline','proceed','abstain') NOT NULL,
	CONSTRAINT `decline_observation_votes_ref_user_pk` PRIMARY KEY(`ref`,`user`)
);
--> statement-breakpoint
CREATE TABLE `guild_staff` (
	`guild` varchar(20) NOT NULL,
	`user` varchar(20) NOT NULL,
	CONSTRAINT `guild_staff_guild_user_pk` PRIMARY KEY(`guild`,`user`)
);
--> statement-breakpoint
CREATE TABLE `polls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('decline-observation') NOT NULL,
	`message` varchar(20) NOT NULL,
	`reminder` bigint NOT NULL,
	`deadline` bigint NOT NULL,
	`closed` boolean NOT NULL,
	`truly_closed` boolean NOT NULL,
	CONSTRAINT `polls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vote_tracker` (
	`poll` int NOT NULL,
	`user` varchar(20) NOT NULL,
	CONSTRAINT `vote_tracker_poll_user_pk` PRIMARY KEY(`poll`,`user`)
);
--> statement-breakpoint
ALTER TABLE `guilds` ADD `owner` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `guilds` ADD `advisor` varchar(20);--> statement-breakpoint
ALTER TABLE `guilds` ADD `delegated` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `staff`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `owner`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `advisor`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `council`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `voter`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `global_mod`;--> statement-breakpoint
ALTER TABLE `decline_observation_polls` ADD CONSTRAINT `decline_observation_polls_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `decline_observation_votes` ADD CONSTRAINT `decline_observation_votes_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `guild_staff` ADD CONSTRAINT `guild_staff_guild_guilds_id_fk` FOREIGN KEY (`guild`) REFERENCES `guilds`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `vote_tracker` ADD CONSTRAINT `vote_tracker_poll_polls_id_fk` FOREIGN KEY (`poll`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;