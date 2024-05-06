CREATE TABLE `guilds` (
	`id` varchar(20) NOT NULL,
	`mascot` varchar(32) NOT NULL,
	`name` text NOT NULL,
	`invite` text NOT NULL,
	`image` text NOT NULL,
	CONSTRAINT `guilds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `guilds` ADD CONSTRAINT `guilds_mascot_characters_id_fk` FOREIGN KEY (`mascot`) REFERENCES `characters`(`id`) ON DELETE no action ON UPDATE no action;