CREATE TABLE `api_keys` (
	`user` varchar(20) NOT NULL,
	`token` varchar(128) NOT NULL,
	CONSTRAINT `api_keys_user` PRIMARY KEY(`user`)
);
