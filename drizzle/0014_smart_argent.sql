CREATE TABLE `banshare_ids` (
	`ref` int NOT NULL,
	`user` varchar(20) NOT NULL,
	CONSTRAINT `banshare_ids_ref_user_pk` PRIMARY KEY(`ref`,`user`)
);
--> statement-breakpoint
CREATE TABLE `banshares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`message` varchar(20) NOT NULL,
	`author` varchar(20) NOT NULL,
	`display` varchar(1024) NOT NULL,
	`reason` varchar(498) NOT NULL,
	`evidence` varchar(1000) NOT NULL,
	`server` varchar(20) NOT NULL,
	`severity` varchar(8) NOT NULL,
	`urgent` boolean NOT NULL,
	`reminded` bigint NOT NULL,
	CONSTRAINT `banshares_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_message` ON `banshares` (`message`);--> statement-breakpoint
ALTER TABLE `banshare_ids` ADD CONSTRAINT `banshare_ids_ref_banshares_id_fk` FOREIGN KEY (`ref`) REFERENCES `banshares`(`id`) ON DELETE cascade ON UPDATE cascade;