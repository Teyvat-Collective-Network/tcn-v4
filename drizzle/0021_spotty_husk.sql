ALTER TABLE `ban_tasks` MODIFY COLUMN `status` enum('pending','skipped','banned','failed','hold') NOT NULL;