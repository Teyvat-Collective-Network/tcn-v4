CREATE TABLE `global_info_request_guilds` (
	`ref` int NOT NULL,
	`guild` varchar(20) NOT NULL,
	`name` text NOT NULL,
	CONSTRAINT `global_info_request_guilds_ref_guild_pk` PRIMARY KEY(`ref`,`guild`)
);
--> statement-breakpoint
DROP TABLE `global_info_on_user_requests`;--> statement-breakpoint
ALTER TABLE `global_info_request_guilds` ADD CONSTRAINT `global_info_request_guilds_ref_global_messages_id_fk` FOREIGN KEY (`ref`) REFERENCES `global_messages`(`id`) ON DELETE cascade ON UPDATE cascade;