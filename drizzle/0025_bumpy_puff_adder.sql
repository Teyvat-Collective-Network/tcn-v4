ALTER TABLE `audit_logs` MODIFY COLUMN `actor` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD `time` bigint NOT NULL;