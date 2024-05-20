CREATE TABLE `application_polls` (
	`ref` int NOT NULL,
	`thread` varchar(20) NOT NULL,
	CONSTRAINT `application_polls_ref` PRIMARY KEY(`ref`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`thread` varchar(20) NOT NULL,
	`guild` varchar(20) NOT NULL,
	`invite` text NOT NULL,
	`url` varchar(128) NOT NULL,
	`user` varchar(20) NOT NULL,
	`name` text NOT NULL,
	`experience` varchar(1024) NOT NULL,
	`goals` varchar(1024) NOT NULL,
	`history` varchar(1024) NOT NULL,
	`additional` varchar(1024) NOT NULL,
	CONSTRAINT `applications_thread` PRIMARY KEY(`thread`)
);
--> statement-breakpoint
CREATE TABLE `audit_entry_targets` (
	`target` varchar(20) NOT NULL,
	`ref` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`time` bigint NOT NULL,
	`actor` varchar(20) NOT NULL,
	`type` varchar(64) NOT NULL,
	`guild` varchar(20),
	`data` json,
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auto_staff_roles` (
	`guild` varchar(20) NOT NULL,
	`role` varchar(20) NOT NULL,
	CONSTRAINT `auto_staff_roles_guild_role_pk` PRIMARY KEY(`guild`,`role`)
);
--> statement-breakpoint
CREATE TABLE `autosync_settings` (
	`guild` varchar(20) NOT NULL,
	`location` enum('disabled','channel','webhook') NOT NULL,
	`channel` varchar(20),
	`webhook` text,
	`message` varchar(20),
	`repost` boolean NOT NULL DEFAULT false,
	CONSTRAINT `autosync_settings_guild` PRIMARY KEY(`guild`)
);
--> statement-breakpoint
CREATE TABLE `aux_global_authors` (
	`message` varchar(20) NOT NULL,
	`user` varchar(20) NOT NULL,
	CONSTRAINT `aux_global_authors_message` PRIMARY KEY(`message`)
);
--> statement-breakpoint
CREATE TABLE `cancel_observation_votes` (
	`ref` int NOT NULL,
	`user` varchar(20) NOT NULL,
	`vote` enum('cancel','continue','abstain') NOT NULL,
	CONSTRAINT `cancel_observation_votes_ref_user_pk` PRIMARY KEY(`ref`,`user`)
);
--> statement-breakpoint
CREATE TABLE `characters` (
	`id` varchar(32) NOT NULL,
	`short` varchar(32),
	`name` varchar(64) NOT NULL,
	`element` varchar(32) NOT NULL,
	CONSTRAINT `characters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `decline_observation_votes` (
	`ref` int NOT NULL,
	`user` varchar(20) NOT NULL,
	`vote` enum('decline','proceed','abstain') NOT NULL,
	CONSTRAINT `decline_observation_votes_ref_user_pk` PRIMARY KEY(`ref`,`user`)
);
--> statement-breakpoint
CREATE TABLE `election_history` (
	`wave` int NOT NULL,
	`user` varchar(20) NOT NULL,
	`status` enum('nominated','accepted','declined','elected','tied','runner-up') NOT NULL,
	`rerunning` boolean NOT NULL,
	CONSTRAINT `election_history_wave_user_pk` PRIMARY KEY(`wave`,`user`)
);
--> statement-breakpoint
CREATE TABLE `election_polls` (
	`ref` int NOT NULL,
	`thread` varchar(20) NOT NULL,
	`candidates` json NOT NULL,
	`autopromoted` boolean NOT NULL DEFAULT false,
	CONSTRAINT `election_polls_ref` PRIMARY KEY(`ref`)
);
--> statement-breakpoint
CREATE TABLE `election_statements` (
	`wave` int NOT NULL,
	`user` varchar(20) NOT NULL,
	`message` varchar(20) NOT NULL,
	CONSTRAINT `election_statements_wave_user_pk` PRIMARY KEY(`wave`,`user`)
);
--> statement-breakpoint
CREATE TABLE `election_votes` (
	`ref` int NOT NULL,
	`user` varchar(20) NOT NULL,
	`vote` json NOT NULL,
	CONSTRAINT `election_votes_ref_user_pk` PRIMARY KEY(`ref`,`user`)
);
--> statement-breakpoint
CREATE TABLE `elections` (
	`wave` int NOT NULL,
	`channel` varchar(20) NOT NULL,
	`seats` int NOT NULL,
	CONSTRAINT `elections_wave` PRIMARY KEY(`wave`)
);
--> statement-breakpoint
CREATE TABLE `expected_voters` (
	`poll` int NOT NULL,
	`user` varchar(20) NOT NULL,
	CONSTRAINT `expected_voters_poll_user_pk` PRIMARY KEY(`poll`,`user`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`uuid` varchar(36) NOT NULL,
	`channel` varchar(20) NOT NULL,
	`message` varchar(20) NOT NULL,
	CONSTRAINT `files_uuid` PRIMARY KEY(`uuid`)
);
--> statement-breakpoint
CREATE TABLE `forced_staff` (
	`guild` varchar(20) NOT NULL,
	`user` varchar(20) NOT NULL,
	`staff` boolean NOT NULL,
	CONSTRAINT `forced_staff_guild_user_pk` PRIMARY KEY(`guild`,`user`)
);
--> statement-breakpoint
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
	`panic` boolean NOT NULL DEFAULT false,
	`protected` boolean NOT NULL DEFAULT false,
	`important` boolean NOT NULL DEFAULT false,
	`info_on_user_plugin` boolean NOT NULL DEFAULT false,
	`logs` varchar(20),
	CONSTRAINT `global_channels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `global_connections` (
	`channel` int NOT NULL,
	`guild` varchar(20) NOT NULL,
	`location` varchar(20) NOT NULL,
	CONSTRAINT `global_connections_location` PRIMARY KEY(`location`),
	CONSTRAINT `unq_channel_guild` UNIQUE(`channel`,`guild`)
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
CREATE TABLE `global_info_on_user_request_instances` (
	`ref` int NOT NULL,
	`guild` varchar(20) NOT NULL,
	`channel` varchar(20) NOT NULL,
	`message` varchar(20) NOT NULL,
	CONSTRAINT `global_info_on_user_request_instances_message` PRIMARY KEY(`message`)
);
--> statement-breakpoint
CREATE TABLE `global_info_request_guilds` (
	`ref` int NOT NULL,
	`guild` varchar(20) NOT NULL,
	`name` text NOT NULL,
	CONSTRAINT `global_info_request_guilds_ref_guild_pk` PRIMARY KEY(`ref`,`guild`)
);
--> statement-breakpoint
CREATE TABLE `global_message_instances` (
	`ref` int NOT NULL,
	`guild` varchar(20) NOT NULL,
	`channel` varchar(20) NOT NULL,
	`message` varchar(20) NOT NULL,
	`never_delete` boolean NOT NULL DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `global_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channel` int NOT NULL,
	`author` varchar(20) NOT NULL,
	`origin_guild` varchar(20) NOT NULL,
	`origin_channel` varchar(20) NOT NULL,
	`origin_message` varchar(20) NOT NULL,
	`deleted` boolean NOT NULL DEFAULT false,
	`time` bigint NOT NULL,
	`content` text NOT NULL,
	`embeds` json,
	`attachments` json,
	`username` varchar(80) NOT NULL,
	`avatar` text NOT NULL,
	CONSTRAINT `global_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `global_mod_logs` (
	`user` varchar(20) NOT NULL,
	`actor` varchar(20) NOT NULL,
	`action` enum('warn','ban','unban') NOT NULL,
	`reason` varchar(256)
);
--> statement-breakpoint
CREATE TABLE `global_mods` (
	`channel` int NOT NULL,
	`user` varchar(20) NOT NULL,
	CONSTRAINT `global_mods_channel_user_pk` PRIMARY KEY(`channel`,`user`)
);
--> statement-breakpoint
CREATE TABLE `global_webhook_tracker` (
	`webhook` varchar(20) NOT NULL,
	CONSTRAINT `global_webhook_tracker_webhook` PRIMARY KEY(`webhook`)
);
--> statement-breakpoint
CREATE TABLE `guild_staff` (
	`guild` varchar(20) NOT NULL,
	`user` varchar(20) NOT NULL,
	CONSTRAINT `guild_staff_guild_user_pk` PRIMARY KEY(`guild`,`user`)
);
--> statement-breakpoint
CREATE TABLE `guilds` (
	`id` varchar(20) NOT NULL,
	`mascot` varchar(32) NOT NULL,
	`name` text NOT NULL,
	`invite` text NOT NULL,
	`image` text NOT NULL,
	`owner` varchar(20) NOT NULL,
	`advisor` varchar(20),
	`delegated` boolean NOT NULL,
	`role_color` int NOT NULL,
	`role_name` varchar(80) NOT NULL,
	`hq_role` varchar(20) NOT NULL,
	`hub_role` varchar(20) NOT NULL,
	CONSTRAINT `guilds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hub_partner_list_location` (
	`id` int NOT NULL,
	`message` varchar(20) NOT NULL,
	CONSTRAINT `hub_partner_list_location_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `induction_polls` (
	`ref` int NOT NULL,
	`mode` enum('normal','pre-approve','positive-tiebreak','negative-tiebreak') NOT NULL,
	CONSTRAINT `induction_polls_ref` PRIMARY KEY(`ref`)
);
--> statement-breakpoint
CREATE TABLE `induction_votes` (
	`ref` int NOT NULL,
	`user` varchar(20) NOT NULL,
	`vote` enum('induct','preapprove','reject','extend','abstain') NOT NULL,
	CONSTRAINT `induction_votes_ref_user_pk` PRIMARY KEY(`ref`,`user`)
);
--> statement-breakpoint
CREATE TABLE `polls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('decline-observation','cancel-observation','induction','election','proposal','selection') NOT NULL,
	`message` varchar(20) NOT NULL,
	`reminder` bigint,
	`deadline` bigint NOT NULL,
	`closed` boolean NOT NULL,
	`truly_closed` boolean NOT NULL,
	`errored` boolean NOT NULL DEFAULT false,
	CONSTRAINT `polls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposal_polls` (
	`ref` int NOT NULL,
	`question` varchar(1024) NOT NULL,
	CONSTRAINT `proposal_polls_ref` PRIMARY KEY(`ref`)
);
--> statement-breakpoint
CREATE TABLE `proposal_votes` (
	`ref` int NOT NULL,
	`user` varchar(20) NOT NULL,
	`vote` enum('accept','reject','abstain') NOT NULL,
	CONSTRAINT `proposal_votes_ref_user_pk` PRIMARY KEY(`ref`,`user`)
);
--> statement-breakpoint
CREATE TABLE `selection_polls` (
	`ref` int NOT NULL,
	`question` varchar(1024) NOT NULL,
	`options` json NOT NULL,
	`minimum` int NOT NULL,
	`maximum` int NOT NULL,
	CONSTRAINT `selection_polls_ref` PRIMARY KEY(`ref`)
);
--> statement-breakpoint
CREATE TABLE `selection_votes` (
	`ref` int NOT NULL,
	`user` varchar(20) NOT NULL,
	`vote` json NOT NULL,
	CONSTRAINT `selection_votes_ref_user_pk` PRIMARY KEY(`ref`,`user`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(20) NOT NULL,
	`observer` boolean NOT NULL DEFAULT false,
	`observer_since` bigint NOT NULL DEFAULT 0,
	`global_nickname` varchar(40) DEFAULT null,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vote_tracker` (
	`poll` int NOT NULL,
	`user` varchar(20) NOT NULL,
	CONSTRAINT `vote_tracker_poll_user_pk` PRIMARY KEY(`poll`,`user`)
);
--> statement-breakpoint
CREATE INDEX `idx_target` ON `audit_entry_targets` (`target`);--> statement-breakpoint
CREATE INDEX `idx_actor_guild_type` ON `audit_logs` (`actor`,`guild`,`type`);--> statement-breakpoint
CREATE INDEX `idx_guild_type` ON `audit_logs` (`guild`,`type`);--> statement-breakpoint
CREATE INDEX `idx_type` ON `audit_logs` (`type`);--> statement-breakpoint
CREATE INDEX `idx_thread` ON `election_polls` (`thread`);--> statement-breakpoint
CREATE INDEX `idx_channel` ON `elections` (`channel`);--> statement-breakpoint
CREATE INDEX `idx_filter` ON `global_filter_terms` (`filter`);--> statement-breakpoint
CREATE INDEX `idx_ref` ON `global_info_on_user_request_instances` (`ref`);--> statement-breakpoint
CREATE INDEX `idx_message` ON `global_message_instances` (`message`);--> statement-breakpoint
CREATE INDEX `idx_author` ON `global_messages` (`author`);--> statement-breakpoint
ALTER TABLE `application_polls` ADD CONSTRAINT `application_polls_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `application_polls` ADD CONSTRAINT `application_polls_thread_applications_thread_fk` FOREIGN KEY (`thread`) REFERENCES `applications`(`thread`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `audit_entry_targets` ADD CONSTRAINT `audit_entry_targets_ref_audit_logs_id_fk` FOREIGN KEY (`ref`) REFERENCES `audit_logs`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `auto_staff_roles` ADD CONSTRAINT `auto_staff_roles_guild_guilds_id_fk` FOREIGN KEY (`guild`) REFERENCES `guilds`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `autosync_settings` ADD CONSTRAINT `autosync_settings_guild_guilds_id_fk` FOREIGN KEY (`guild`) REFERENCES `guilds`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `cancel_observation_votes` ADD CONSTRAINT `cancel_observation_votes_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `decline_observation_votes` ADD CONSTRAINT `decline_observation_votes_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `election_history` ADD CONSTRAINT `election_history_wave_elections_wave_fk` FOREIGN KEY (`wave`) REFERENCES `elections`(`wave`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `election_polls` ADD CONSTRAINT `election_polls_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `election_polls` ADD CONSTRAINT `election_polls_thread_elections_channel_fk` FOREIGN KEY (`thread`) REFERENCES `elections`(`channel`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `election_statements` ADD CONSTRAINT `election_statements_wave_elections_wave_fk` FOREIGN KEY (`wave`) REFERENCES `elections`(`wave`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `election_votes` ADD CONSTRAINT `election_votes_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `expected_voters` ADD CONSTRAINT `expected_voters_poll_polls_id_fk` FOREIGN KEY (`poll`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `forced_staff` ADD CONSTRAINT `forced_staff_guild_guilds_id_fk` FOREIGN KEY (`guild`) REFERENCES `guilds`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_applied_filters` ADD CONSTRAINT `global_applied_filters_channel_global_channels_id_fk` FOREIGN KEY (`channel`) REFERENCES `global_channels`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_applied_filters` ADD CONSTRAINT `global_applied_filters_filter_global_filters_id_fk` FOREIGN KEY (`filter`) REFERENCES `global_filters`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_bans` ADD CONSTRAINT `global_bans_channel_global_channels_id_fk` FOREIGN KEY (`channel`) REFERENCES `global_channels`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_connections` ADD CONSTRAINT `global_connections_channel_global_channels_id_fk` FOREIGN KEY (`channel`) REFERENCES `global_channels`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_filter_terms` ADD CONSTRAINT `global_filter_terms_filter_global_filters_id_fk` FOREIGN KEY (`filter`) REFERENCES `global_filters`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_info_on_user_request_instances` ADD CONSTRAINT `global_info_on_user_request_instances_ref_global_messages_id_fk` FOREIGN KEY (`ref`) REFERENCES `global_messages`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_info_request_guilds` ADD CONSTRAINT `global_info_request_guilds_ref_global_messages_id_fk` FOREIGN KEY (`ref`) REFERENCES `global_messages`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_message_instances` ADD CONSTRAINT `global_message_instances_ref_global_messages_id_fk` FOREIGN KEY (`ref`) REFERENCES `global_messages`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_messages` ADD CONSTRAINT `global_messages_channel_global_channels_id_fk` FOREIGN KEY (`channel`) REFERENCES `global_channels`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_mods` ADD CONSTRAINT `global_mods_channel_global_channels_id_fk` FOREIGN KEY (`channel`) REFERENCES `global_channels`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `guild_staff` ADD CONSTRAINT `guild_staff_guild_guilds_id_fk` FOREIGN KEY (`guild`) REFERENCES `guilds`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `guilds` ADD CONSTRAINT `guilds_mascot_characters_id_fk` FOREIGN KEY (`mascot`) REFERENCES `characters`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `induction_polls` ADD CONSTRAINT `induction_polls_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `induction_votes` ADD CONSTRAINT `induction_votes_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `proposal_polls` ADD CONSTRAINT `proposal_polls_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `proposal_votes` ADD CONSTRAINT `proposal_votes_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `selection_polls` ADD CONSTRAINT `selection_polls_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `selection_votes` ADD CONSTRAINT `selection_votes_ref_polls_id_fk` FOREIGN KEY (`ref`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `vote_tracker` ADD CONSTRAINT `vote_tracker_poll_polls_id_fk` FOREIGN KEY (`poll`) REFERENCES `polls`(`id`) ON DELETE cascade ON UPDATE cascade;