CREATE TABLE `global_info_on_user_request_instances` (
	`ref` int NOT NULL,
	`guild` varchar(20) NOT NULL,
	`channel` varchar(20) NOT NULL,
	`message` varchar(20) NOT NULL,
	CONSTRAINT `global_info_on_user_request_instances_message` PRIMARY KEY(`message`)
);
--> statement-breakpoint
CREATE TABLE `global_info_on_user_requests` (
	`ref` int NOT NULL,
	`text` text NOT NULL,
	`count` int NOT NULL,
	CONSTRAINT `global_info_on_user_requests_ref` PRIMARY KEY(`ref`)
);
--> statement-breakpoint
CREATE INDEX `idx_ref` ON `global_info_on_user_request_instances` (`ref`);--> statement-breakpoint
ALTER TABLE `global_info_on_user_request_instances` ADD CONSTRAINT `global_info_on_user_request_instances_ref_global_messages_id_fk` FOREIGN KEY (`ref`) REFERENCES `global_messages`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_info_on_user_requests` ADD CONSTRAINT `global_info_on_user_requests_ref_global_messages_id_fk` FOREIGN KEY (`ref`) REFERENCES `global_messages`(`id`) ON DELETE cascade ON UPDATE cascade;