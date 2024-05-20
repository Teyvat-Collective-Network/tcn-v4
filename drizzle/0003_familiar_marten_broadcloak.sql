ALTER TABLE `network_user_reports` MODIFY COLUMN `reason` varchar(480) NOT NULL;--> statement-breakpoint
ALTER TABLE `report_tasks` MODIFY COLUMN `status` enum('pending','skipped','success','failed','hold') NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `reports_quiz_passed` boolean DEFAULT false NOT NULL;