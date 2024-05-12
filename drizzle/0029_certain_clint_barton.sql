CREATE TABLE `election_polls` (
	`ref` int NOT NULL,
	`thread` varchar(20) NOT NULL,
	`candidates` json NOT NULL,
	CONSTRAINT `election_polls_ref` PRIMARY KEY(`ref`)
);
--> statement-breakpoint
CREATE TABLE `election_statements` (
	`wave` int NOT NULL,
	`user` varchar(20) NOT NULL,
	`message` varchar(20) NOT NULL,
	CONSTRAINT `election_statements_wave_user_pk` PRIMARY KEY(`wave`,`user`)
);
--> statement-breakpoint
CREATE TABLE `election_votes` (
	`ref` int NOT NULL,
	`user` varchar(20) NOT NULL,
	`vote` json NOT NULL,
	CONSTRAINT `election_votes_ref_user_pk` PRIMARY KEY(`ref`,`user`)
);
--> statement-breakpoint
CREATE TABLE `elections` (
	`wave` int NOT NULL,
	`channel` varchar(20) NOT NULL,
	`seats` int NOT NULL,
	CONSTRAINT `elections_wave` PRIMARY KEY(`wave`)
);
--> statement-breakpoint
ALTER TABLE `polls` MODIFY COLUMN `type` enum('decline-observation','cancel-observation','induction','election') NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_thread` ON `election_polls` (`thread`);--> statement-breakpoint
CREATE INDEX `idx_channel` ON `elections` (`channel`);--> statement-breakpoint
ALTER TABLE `election_history` ADD CONSTRAINT `election_history_wave_elections_wave_fk` FOREIGN KEY (`wave`) REFERENCES `elections`(`wave`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `election_polls` ADD CONSTRAINT `election_polls_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `election_polls` ADD CONSTRAINT `election_polls_thread_elections_channel_fk` FOREIGN KEY (`thread`) REFERENCES `elections`(`channel`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `election_statements` ADD CONSTRAINT `election_statements_wave_elections_wave_fk` FOREIGN KEY (`wave`) REFERENCES `elections`(`wave`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `election_votes` ADD CONSTRAINT `election_votes_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;