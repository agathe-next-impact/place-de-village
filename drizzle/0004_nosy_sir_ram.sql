CREATE TABLE `email_queue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`to_address` text NOT NULL,
	`to_name` text,
	`subject` text NOT NULL,
	`text` text NOT NULL,
	`html` text,
	`template` text NOT NULL,
	`related_entity` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`sent_at` integer
);
--> statement-breakpoint
CREATE INDEX `email_queue_status_idx` ON `email_queue` (`status`);