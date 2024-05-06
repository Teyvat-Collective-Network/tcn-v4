CREATE TABLE `application_polls` (
	`ref` int NOT NULL,
	`thread` varchar(20) NOT NULL,
	CONSTRAINT `application_polls_ref` PRIMARY KEY(`ref`)
);
--> statement-breakpoint
DROP TABLE `decline_observation_polls`;--> statement-breakpoint
ALTER TABLE `applications` ADD `url` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `application_polls` ADD CONSTRAINT `application_polls_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `application_polls` ADD CONSTRAINT `application_polls_thread_applications_thread_fk` FOREIGN KEY (`thread`) REFERENCES `applications`(`thread`) ON DELETE no action ON UPDATE no action;