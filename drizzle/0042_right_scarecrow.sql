CREATE TABLE `global_connections` (
	`channel` int NOT NULL,
	`guild` varchar(20) NOT NULL,
	`location` varchar(20) NOT NULL,
	`suspended` boolean NOT NULL,
	CONSTRAINT `global_connections_location` PRIMARY KEY(`location`),
	CONSTRAINT `unq_channel_guild` UNIQUE(`channel`,`guild`)
);
--> statement-breakpoint
ALTER TABLE `global_connections` ADD CONSTRAINT `global_connections_channel_global_channels_id_fk` FOREIGN KEY (`channel`) REFERENCES `global_channels`(`id`) ON DELETE cascade ON UPDATE cascade;