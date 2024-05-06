ALTER TABLE `application_polls` DROP FOREIGN KEY `application_polls_thread_applications_thread_fk`;
--> statement-breakpoint
ALTER TABLE `application_polls` ADD CONSTRAINT `application_polls_thread_applications_thread_fk` FOREIGN KEY (`thread`) REFERENCES `applications`(`thread`) ON DELETE cascade ON UPDATE cascade;