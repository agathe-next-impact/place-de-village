PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_signalements` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`titre` text NOT NULL,
	`description` text,
	`auteur_id` text NOT NULL,
	`auteur` text NOT NULL,
	`etat` text DEFAULT 'signale' NOT NULL,
	`loc` text NOT NULL,
	`lat` real,
	`lng` real,
	`icon` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`auteur_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_signalements`("id", "type", "titre", "description", "auteur_id", "auteur", "etat", "loc", "lat", "lng", "icon", "created_at", "updated_at") SELECT "id", "type", "titre", "description", "auteur_id", "auteur", "etat", "loc", "lat", "lng", "icon", "created_at", "updated_at" FROM `signalements`;--> statement-breakpoint
DROP TABLE `signalements`;--> statement-breakpoint
ALTER TABLE `__new_signalements` RENAME TO `signalements`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `signalements_etat_idx` ON `signalements` (`etat`);--> statement-breakpoint
CREATE INDEX `signalements_created_idx` ON `signalements` (`created_at`);