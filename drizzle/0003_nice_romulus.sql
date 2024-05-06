ALTER TABLE `guilds` DROP FOREIGN KEY `guilds_mascot_characters_id_fk`;
--> statement-breakpoint
ALTER TABLE `guilds` ADD CONSTRAINT `guilds_mascot_characters_id_fk` FOREIGN KEY (`mascot`) REFERENCES `characters`(`id`) ON DELETE cascade ON UPDATE cascade;