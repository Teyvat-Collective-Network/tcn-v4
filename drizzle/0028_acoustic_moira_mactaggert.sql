CREATE TABLE `election_history` (
	`wave` int NOT NULL,
	`user` varchar(20) NOT NULL,
	`status` enum('nominated','accepted','declined','elected','runner-up') NOT NULL,
	`rerunning` boolean NOT NULL
);
