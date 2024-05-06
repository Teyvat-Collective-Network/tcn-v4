CREATE TABLE `cancel_observation_votes` (
	`ref` int NOT NULL,
	`user` varchar(20) NOT NULL,
	`vote` enum('cancel','continue','abstain') NOT NULL,
	CONSTRAINT `cancel_observation_votes_ref_user_pk` PRIMARY KEY(`ref`,`user`)
);
--> statement-breakpoint
ALTER TABLE `polls` MODIFY COLUMN `type` enum('decline-observation','cancel-observation') NOT NULL;--> statement-breakpoint
ALTER TABLE `cancel_observation_votes` ADD CONSTRAINT `cancel_observation_votes_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;