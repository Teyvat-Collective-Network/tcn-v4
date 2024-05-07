CREATE TABLE `banlists` (
	`uuid` varchar(36) NOT NULL,
	`content` text NOT NULL,
	CONSTRAINT `banlists_uuid` PRIMARY KEY(`uuid`)
);
--> statement-breakpoint
ALTER TABLE `banshares` ADD `usernames` varchar(1024) NOT NULL;--> statement-breakpoint
ALTER TABLE `banshares` ADD `status` enum('pending','locked','rejected','published','rescinded') NOT NULL;