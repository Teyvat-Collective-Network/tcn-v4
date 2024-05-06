CREATE TABLE `characters` (
	`id` varchar(32) NOT NULL,
	`short` varchar(32),
	`name` varchar(64) NOT NULL,
	`element` varchar(32) NOT NULL,
	CONSTRAINT `characters_id` PRIMARY KEY(`id`)
);
