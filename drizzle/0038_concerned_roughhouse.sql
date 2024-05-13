CREATE TABLE `global_applied_filters` (
	`channel` int NOT NULL,
	`filter` int NOT NULL,
	CONSTRAINT `global_applied_filters_channel_filter_pk` PRIMARY KEY(`channel`,`filter`)
);
--> statement-breakpoint
CREATE TABLE `global_bans` (
	`channel` int NOT NULL,
	`user` varchar(20) NOT NULL,
	CONSTRAINT `global_bans_channel_user_pk` PRIMARY KEY(`channel`,`user`)
);
--> statement-breakpoint
CREATE TABLE `global_channels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(80) NOT NULL,
	`visible` boolean NOT NULL,
	`password` varchar(128),
	`logs` varchar(20) NOT NULL,
	`panic` boolean NOT NULL DEFAULT false,
	`protected` boolean NOT NULL DEFAULT false,
	CONSTRAINT `global_channels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `global_filter_terms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`filter` int NOT NULL,
	`term` text NOT NULL,
	`regex` boolean NOT NULL,
	CONSTRAINT `global_filter_terms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `global_filters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(80) NOT NULL,
	CONSTRAINT `global_filters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `global_message_instances` (
	`ref` int NOT NULL,
	`guild` varchar(20) NOT NULL,
	`channel` varchar(20) NOT NULL,
	`message` varchar(20) NOT NULL,
	`log` boolean NOT NULL DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `global_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channel` int NOT NULL,
	`author` varchar(20) NOT NULL,
	`origin_guild` varchar(20) NOT NULL,
	`origin_channel` varchar(20) NOT NULL,
	`origin_message` varchar(20) NOT NULL,
	CONSTRAINT `global_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `global_mods` (
	`channel` int NOT NULL,
	`user` varchar(20) NOT NULL,
	CONSTRAINT `global_mods_channel_user_pk` PRIMARY KEY(`channel`,`user`)
);
--> statement-breakpoint
ALTER TABLE `global_applied_filters` ADD CONSTRAINT `global_applied_filters_channel_global_channels_id_fk` FOREIGN KEY (`channel`) REFERENCES `global_channels`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_applied_filters` ADD CONSTRAINT `global_applied_filters_filter_global_filters_id_fk` FOREIGN KEY (`filter`) REFERENCES `global_filters`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_bans` ADD CONSTRAINT `global_bans_channel_global_channels_id_fk` FOREIGN KEY (`channel`) REFERENCES `global_channels`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_filter_terms` ADD CONSTRAINT `global_filter_terms_filter_global_filters_id_fk` FOREIGN KEY (`filter`) REFERENCES `global_filters`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_message_instances` ADD CONSTRAINT `global_message_instances_ref_global_messages_id_fk` FOREIGN KEY (`ref`) REFERENCES `global_messages`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_messages` ADD CONSTRAINT `global_messages_channel_global_channels_id_fk` FOREIGN KEY (`channel`) REFERENCES `global_channels`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_mods` ADD CONSTRAINT `global_mods_channel_global_channels_id_fk` FOREIGN KEY (`channel`) REFERENCES `global_channels`(`id`) ON DELETE cascade ON UPDATE cascade;