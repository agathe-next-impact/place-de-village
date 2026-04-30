CREATE TABLE `sms_queue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`to_phone` text NOT NULL,
	`body` text NOT NULL,
	`template` text NOT NULL,
	`related_entity` text,
	`scheduled_at` integer DEFAULT (unixepoch()) NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`sent_at` integer
);
--> statement-breakpoint
CREATE INDEX `sms_queue_status_idx` ON `sms_queue` (`status`);--> statement-breakpoint
CREATE INDEX `sms_queue_sched_idx` ON `sms_queue` (`scheduled_at`);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` text;