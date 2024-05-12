CREATE TABLE `proposal_polls` (
	`ref` int NOT NULL,
	`question` varchar(1024) NOT NULL,
	CONSTRAINT `proposal_polls_ref` PRIMARY KEY(`ref`)
);
--> statement-breakpoint
CREATE TABLE `proposal_votes` (
	`ref` int NOT NULL,
	`user` varchar(20) NOT NULL,
	`vote` enum('accept','reject','abstain') NOT NULL,
	CONSTRAINT `proposal_votes_ref_user_pk` PRIMARY KEY(`ref`,`user`)
);
--> statement-breakpoint
CREATE TABLE `selection_polls` (
	`ref` int NOT NULL,
	`question` varchar(1024) NOT NULL,
	`options` json NOT NULL,
	`minimum` int NOT NULL,
	`maximum` int NOT NULL,
	CONSTRAINT `selection_polls_ref` PRIMARY KEY(`ref`)
);
--> statement-breakpoint
CREATE TABLE `selection_votes` (
	`ref` int NOT NULL,
	`user` varchar(20) NOT NULL,
	`vote` json NOT NULL,
	CONSTRAINT `selection_votes_ref_user_pk` PRIMARY KEY(`ref`,`user`)
);
--> statement-breakpoint
ALTER TABLE `polls` MODIFY COLUMN `type` enum('decline-observation','cancel-observation','induction','election','proposal','selection') NOT NULL;--> statement-breakpoint
ALTER TABLE `proposal_polls` ADD CONSTRAINT `proposal_polls_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `proposal_votes` ADD CONSTRAINT `proposal_votes_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `selection_polls` ADD CONSTRAINT `selection_polls_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `selection_votes` ADD CONSTRAINT `selection_votes_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;