CREATE TABLE `induction_polls` (
	`ref` int NOT NULL,
	`mode` enum('normal','pre-approve','positive-tiebreak','negative-tiebreak') NOT NULL,
	CONSTRAINT `induction_polls_ref` PRIMARY KEY(`ref`)
);
--> statement-breakpoint
CREATE TABLE `induction_votes` (
	`ref` int NOT NULL,
	`user` varchar(20) NOT NULL,
	`vote` enum('induct','preapprove','reject','extend','abstain') NOT NULL,
	CONSTRAINT `induction_votes_ref_user_pk` PRIMARY KEY(`ref`,`user`)
);
--> statement-breakpoint
ALTER TABLE `polls` MODIFY COLUMN `type` enum('decline-observation','cancel-observation','induction') NOT NULL;--> statement-breakpoint
ALTER TABLE `induction_polls` ADD CONSTRAINT `induction_polls_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `induction_votes` ADD CONSTRAINT `induction_votes_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;