CREATE TABLE `agenda_items` (
	`id` text PRIMARY KEY NOT NULL,
	`titre` text NOT NULL,
	`date` text NOT NULL,
	`jour` text NOT NULL,
	`heure` text NOT NULL,
	`lieu` text NOT NULL,
	`type` text NOT NULL,
	`iso` text
);
--> statement-breakpoint
CREATE TABLE `annonces` (
	`id` text PRIMARY KEY NOT NULL,
	`titre` text NOT NULL,
	`resume` text NOT NULL,
	`body` text,
	`date` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `associations` (
	`id` text PRIMARY KEY NOT NULL,
	`nom` text NOT NULL,
	`description` text,
	`contact` text,
	`membres` text
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_id` text,
	`actor_name` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`details` text,
	`at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ccm` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`titre` text NOT NULL,
	`body` text NOT NULL,
	`themes` text
);
--> statement-breakpoint
CREATE TABLE `consents` (
	`user_id` text NOT NULL,
	`finality` text NOT NULL,
	`granted` integer NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`user_id`, `finality`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `contributions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`discussion_id` text NOT NULL,
	`type` text NOT NULL,
	`texte` text NOT NULL,
	`auteur_id` text NOT NULL,
	`auteur` text NOT NULL,
	`at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`discussion_id`) REFERENCES `discussions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`auteur_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`entraide_id` text NOT NULL,
	`a_id` text NOT NULL,
	`b_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`entraide_id`) REFERENCES `entraide`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`a_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`b_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `conv_pair_uniq` ON `conversations` (`entraide_id`,`a_id`,`b_id`);--> statement-breakpoint
CREATE TABLE `discussions` (
	`id` text PRIMARY KEY NOT NULL,
	`titre` text NOT NULL,
	`anim` text NOT NULL,
	`derniere_synth` text,
	`mature` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `entraide` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`titre` text NOT NULL,
	`description` text NOT NULL,
	`quartier` text NOT NULL,
	`date` text,
	`auteur_id` text NOT NULL,
	`auteur` text NOT NULL,
	`age` text,
	`closed` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`auteur_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `equipements` (
	`id` text PRIMARY KEY NOT NULL,
	`nom` text NOT NULL,
	`capacite` text NOT NULL,
	`tarif` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversation_id` text NOT NULL,
	`author_id` text NOT NULL,
	`body` text NOT NULL,
	`at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `mission_registrations` (
	`user_id` text NOT NULL,
	`mission_id` text NOT NULL,
	`at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`user_id`, `mission_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `missions` (
	`id` text PRIMARY KEY NOT NULL,
	`titre` text NOT NULL,
	`cat` text NOT NULL,
	`description` text,
	`date` text NOT NULL,
	`duree` text NOT NULL,
	`lieu` text NOT NULL,
	`besoin` integer NOT NULL,
	`ref` text NOT NULL,
	`ref_user_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`ref_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `petites_annonces` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`cat` text NOT NULL,
	`titre` text NOT NULL,
	`description` text NOT NULL,
	`prix` text,
	`auteur_id` text NOT NULL,
	`auteur` text NOT NULL,
	`expires_at` integer NOT NULL,
	`closed` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`auteur_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `propositions` (
	`id` text PRIMARY KEY NOT NULL,
	`titre` text NOT NULL,
	`constat` text,
	`proposition` text,
	`justification` text,
	`vigilance` text,
	`discussion_id` text,
	`seuil` integer DEFAULT 100 NOT NULL,
	`jours_restants` integer DEFAULT 21 NOT NULL,
	`statut` text DEFAULT 'instruction' NOT NULL,
	`reponse_date` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`discussion_id`) REFERENCES `discussions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`equipement_id` text NOT NULL,
	`user_id` text NOT NULL,
	`user_name` text NOT NULL,
	`start_iso` text NOT NULL,
	`end_iso` text NOT NULL,
	`motif` text NOT NULL,
	`statut` text DEFAULT 'en-attente' NOT NULL,
	`refus_motif` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`equipement_id`) REFERENCES `equipements`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `signal_emissions` (
	`user_id` text NOT NULL,
	`suggestion_id` text NOT NULL,
	`type` text NOT NULL,
	`at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`user_id`, `suggestion_id`, `type`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`suggestion_id`) REFERENCES `suggestions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `signalement_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`signalement_id` text NOT NULL,
	`etat` text NOT NULL,
	`comment` text,
	`agent_id` text,
	`at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`signalement_id`) REFERENCES `signalements`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`agent_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `signalements` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`titre` text NOT NULL,
	`description` text,
	`auteur_id` text NOT NULL,
	`auteur` text NOT NULL,
	`etat` text DEFAULT 'signale' NOT NULL,
	`loc` text NOT NULL,
	`lat` integer,
	`lng` integer,
	`icon` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`auteur_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `signalements_etat_idx` ON `signalements` (`etat`);--> statement-breakpoint
CREATE INDEX `signalements_created_idx` ON `signalements` (`created_at`);--> statement-breakpoint
CREATE TABLE `suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`titre` text NOT NULL,
	`cat` text NOT NULL,
	`auteur_id` text NOT NULL,
	`auteur` text NOT NULL,
	`contributions` integer DEFAULT 0 NOT NULL,
	`mature` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`auteur_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `supports` (
	`user_id` text NOT NULL,
	`proposition_id` text NOT NULL,
	`at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`user_id`, `proposition_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`proposition_id`) REFERENCES `propositions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'habitant' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);