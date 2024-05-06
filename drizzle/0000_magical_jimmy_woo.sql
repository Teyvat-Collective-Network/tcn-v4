CREATE TABLE `users` (
	`id` varchar(20) NOT NULL,
	`staff` boolean NOT NULL DEFAULT false,
	`owner` boolean NOT NULL DEFAULT false,
	`advisor` boolean NOT NULL DEFAULT false,
	`council` boolean NOT NULL DEFAULT false,
	`voter` boolean NOT NULL DEFAULT false,
	`global_mod` boolean NOT NULL DEFAULT false,
	`observer` boolean NOT NULL DEFAULT false,
	`observer_since` bigint NOT NULL DEFAULT 0,
	`global_nickname` varchar(40) DEFAULT null,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
