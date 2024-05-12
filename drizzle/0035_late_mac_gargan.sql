CREATE TABLE `expected_voters` (
	`poll` int NOT NULL,
	`user` varchar(20) NOT NULL,
	CONSTRAINT `expected_voters_poll_user_pk` PRIMARY KEY(`poll`,`user`)
);
--> statement-breakpoint
ALTER TABLE `expected_voters` ADD CONSTRAINT `expected_voters_poll_polls_id_fk` FOREIGN KEY (`poll`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;