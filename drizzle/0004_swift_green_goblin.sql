ALTER TABLE `global_messages` ADD `reply_to` int;--> statement-breakpoint
ALTER TABLE `global_messages` ADD `reply_username` varchar(80) NOT NULL;--> statement-breakpoint
ALTER TABLE `global_message_instances` DROP COLUMN `never_delete`;