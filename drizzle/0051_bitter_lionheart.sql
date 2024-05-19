CREATE TABLE `global_mod_logs` (
	`user` varchar(20) NOT NULL,
	`actor` varchar(20) NOT NULL,
	`action` enum('warn','ban','unban') NOT NULL,
	`reason` varchar(256)
);
--> statement-breakpoint
ALTER TABLE `global_message_instances` ADD `never_delete` boolean DEFAULT false NOT NULL;