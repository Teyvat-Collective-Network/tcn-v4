CREATE TABLE `auto_staff_roles` (
	`guild` varchar(20) NOT NULL,
	`role` varchar(20) NOT NULL,
	CONSTRAINT `auto_staff_roles_guild_role_pk` PRIMARY KEY(`guild`,`role`)
);
--> statement-breakpoint
CREATE TABLE `forced_staff` (
	`guild` varchar(20) NOT NULL,
	`user` varchar(20) NOT NULL,
	`staff` boolean NOT NULL,
	CONSTRAINT `forced_staff_guild_user_pk` PRIMARY KEY(`guild`,`user`)
);
--> statement-breakpoint
ALTER TABLE `election_history` MODIFY COLUMN `status` enum('nominated','accepted','declined','elected','tied','runner-up') NOT NULL;--> statement-breakpoint
ALTER TABLE `auto_staff_roles` ADD CONSTRAINT `auto_staff_roles_guild_guilds_id_fk` FOREIGN KEY (`guild`) REFERENCES `guilds`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `forced_staff` ADD CONSTRAINT `forced_staff_guild_guilds_id_fk` FOREIGN KEY (`guild`) REFERENCES `guilds`(`id`) ON DELETE cascade ON UPDATE cascade;