CREATE TABLE `applications` (
	`thread` varchar(20) NOT NULL,
	`guild` varchar(20) NOT NULL,
	`user` varchar(20) NOT NULL,
	`name` text NOT NULL,
	`experience` varchar(1024) NOT NULL,
	`goals` varchar(1024) NOT NULL,
	`history` varchar(1024) NOT NULL,
	`additional` varchar(1024) NOT NULL,
	CONSTRAINT `applications_thread` PRIMARY KEY(`thread`)
);
