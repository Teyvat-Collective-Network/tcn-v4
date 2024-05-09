CREATE TABLE `banshare_hub_posts` (
	`ref` int NOT NULL,
	`channel` varchar(20) NOT NULL,
	`message` varchar(20) NOT NULL,
	CONSTRAINT `banshare_hub_posts_ref` PRIMARY KEY(`ref`)
);
--> statement-breakpoint
ALTER TABLE `banshare_hub_posts` ADD CONSTRAINT `banshare_hub_posts_ref_banshares_id_fk` FOREIGN KEY (`ref`) REFERENCES `banshares`(`id`) ON DELETE cascade ON UPDATE cascade;