CREATE TABLE "agenda_items" (
	"id" text PRIMARY KEY NOT NULL,
	"titre" text NOT NULL,
	"date" text NOT NULL,
	"jour" text NOT NULL,
	"heure" text NOT NULL,
	"lieu" text NOT NULL,
	"type" text NOT NULL,
	"iso" text
);
--> statement-breakpoint
CREATE TABLE "annonces" (
	"id" text PRIMARY KEY NOT NULL,
	"titre" text NOT NULL,
	"resume" text NOT NULL,
	"body" text,
	"date" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "associations" (
	"id" text PRIMARY KEY NOT NULL,
	"nom" text NOT NULL,
	"description" text,
	"contact" text,
	"membres" text
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" text,
	"actor_name" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"details" text,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ccm" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"titre" text NOT NULL,
	"body" text NOT NULL,
	"themes" text
);
--> statement-breakpoint
CREATE TABLE "consents" (
	"user_id" text NOT NULL,
	"finality" text NOT NULL,
	"granted" boolean NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "consents_user_id_finality_pk" PRIMARY KEY("user_id","finality")
);
--> statement-breakpoint
CREATE TABLE "contributions" (
	"id" serial PRIMARY KEY NOT NULL,
	"discussion_id" text NOT NULL,
	"type" text NOT NULL,
	"texte" text NOT NULL,
	"auteur_id" text NOT NULL,
	"auteur" text NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"entraide_id" text NOT NULL,
	"a_id" text NOT NULL,
	"b_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discussions" (
	"id" text PRIMARY KEY NOT NULL,
	"titre" text NOT NULL,
	"anim" text NOT NULL,
	"derniere_synth" text,
	"mature" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"to_address" text NOT NULL,
	"to_name" text,
	"subject" text NOT NULL,
	"text" text NOT NULL,
	"html" text,
	"template" text NOT NULL,
	"related_entity" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "entraide" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"titre" text NOT NULL,
	"description" text NOT NULL,
	"quartier" text NOT NULL,
	"date" text,
	"auteur_id" text NOT NULL,
	"auteur" text NOT NULL,
	"age" text,
	"closed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipements" (
	"id" text PRIMARY KEY NOT NULL,
	"nom" text NOT NULL,
	"capacite" text NOT NULL,
	"tarif" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "error_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"level" text DEFAULT 'error' NOT NULL,
	"message" text NOT NULL,
	"stack" text,
	"context" text,
	"runtime" text,
	"sentry_event_id" text,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "magic_tokens" (
	"token" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"author_id" text NOT NULL,
	"body" text NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_registrations" (
	"user_id" text NOT NULL,
	"mission_id" text NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mission_registrations_user_id_mission_id_pk" PRIMARY KEY("user_id","mission_id")
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" text PRIMARY KEY NOT NULL,
	"titre" text NOT NULL,
	"cat" text NOT NULL,
	"description" text,
	"date" text NOT NULL,
	"duree" text NOT NULL,
	"lieu" text NOT NULL,
	"besoin" integer NOT NULL,
	"ref" text NOT NULL,
	"ref_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderation_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"reporter_id" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'ouvert' NOT NULL,
	"resolved_by_id" text,
	"resolved_at" timestamp with time zone,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"kind" text NOT NULL,
	"titre" text NOT NULL,
	"body" text,
	"href" text,
	"read_at" timestamp with time zone,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "petites_annonces" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"cat" text NOT NULL,
	"titre" text NOT NULL,
	"description" text NOT NULL,
	"prix" text,
	"auteur_id" text NOT NULL,
	"auteur" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"closed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "propositions" (
	"id" text PRIMARY KEY NOT NULL,
	"titre" text NOT NULL,
	"constat" text,
	"proposition" text,
	"justification" text,
	"vigilance" text,
	"discussion_id" text,
	"seuil" integer DEFAULT 100 NOT NULL,
	"jours_restants" integer DEFAULT 21 NOT NULL,
	"statut" text DEFAULT 'instruction' NOT NULL,
	"reponse_date" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" text PRIMARY KEY NOT NULL,
	"equipement_id" text NOT NULL,
	"user_id" text NOT NULL,
	"user_name" text NOT NULL,
	"start_iso" text NOT NULL,
	"end_iso" text NOT NULL,
	"motif" text NOT NULL,
	"statut" text DEFAULT 'en-attente' NOT NULL,
	"refus_motif" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "signal_emissions" (
	"user_id" text NOT NULL,
	"suggestion_id" text NOT NULL,
	"type" text NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "signal_emissions_user_id_suggestion_id_type_pk" PRIMARY KEY("user_id","suggestion_id","type")
);
--> statement-breakpoint
CREATE TABLE "signalement_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"signalement_id" text NOT NULL,
	"etat" text NOT NULL,
	"comment" text,
	"agent_id" text,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signalements" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"titre" text NOT NULL,
	"description" text,
	"auteur_id" text NOT NULL,
	"auteur" text NOT NULL,
	"etat" text DEFAULT 'signale' NOT NULL,
	"loc" text NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"icon" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sms_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"to_phone" text NOT NULL,
	"body" text NOT NULL,
	"template" text NOT NULL,
	"related_entity" text,
	"scheduled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "suggestions" (
	"id" text PRIMARY KEY NOT NULL,
	"titre" text NOT NULL,
	"cat" text NOT NULL,
	"auteur_id" text NOT NULL,
	"auteur" text NOT NULL,
	"contributions" integer DEFAULT 0 NOT NULL,
	"mature" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supports" (
	"user_id" text NOT NULL,
	"proposition_id" text NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "supports_user_id_proposition_id_pk" PRIMARY KEY("user_id","proposition_id")
);
--> statement-breakpoint
CREATE TABLE "synthesises" (
	"id" serial PRIMARY KEY NOT NULL,
	"discussion_id" text NOT NULL,
	"texte" text NOT NULL,
	"author_id" text NOT NULL,
	"author_name" text NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'habitant' NOT NULL,
	"password_hash" text,
	"email_verified_at" timestamp with time zone,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consents" ADD CONSTRAINT "consents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_discussion_id_discussions_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."discussions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_auteur_id_users_id_fk" FOREIGN KEY ("auteur_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_entraide_id_entraide_id_fk" FOREIGN KEY ("entraide_id") REFERENCES "public"."entraide"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_a_id_users_id_fk" FOREIGN KEY ("a_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_b_id_users_id_fk" FOREIGN KEY ("b_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entraide" ADD CONSTRAINT "entraide_auteur_id_users_id_fk" FOREIGN KEY ("auteur_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_registrations" ADD CONSTRAINT "mission_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_registrations" ADD CONSTRAINT "mission_registrations_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_ref_user_id_users_id_fk" FOREIGN KEY ("ref_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_flags" ADD CONSTRAINT "moderation_flags_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_flags" ADD CONSTRAINT "moderation_flags_resolved_by_id_users_id_fk" FOREIGN KEY ("resolved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "petites_annonces" ADD CONSTRAINT "petites_annonces_auteur_id_users_id_fk" FOREIGN KEY ("auteur_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "propositions" ADD CONSTRAINT "propositions_discussion_id_discussions_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."discussions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_equipement_id_equipements_id_fk" FOREIGN KEY ("equipement_id") REFERENCES "public"."equipements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signal_emissions" ADD CONSTRAINT "signal_emissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signal_emissions" ADD CONSTRAINT "signal_emissions_suggestion_id_suggestions_id_fk" FOREIGN KEY ("suggestion_id") REFERENCES "public"."suggestions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signalement_history" ADD CONSTRAINT "signalement_history_signalement_id_signalements_id_fk" FOREIGN KEY ("signalement_id") REFERENCES "public"."signalements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signalement_history" ADD CONSTRAINT "signalement_history_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signalements" ADD CONSTRAINT "signalements_auteur_id_users_id_fk" FOREIGN KEY ("auteur_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_auteur_id_users_id_fk" FOREIGN KEY ("auteur_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supports" ADD CONSTRAINT "supports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supports" ADD CONSTRAINT "supports_proposition_id_propositions_id_fk" FOREIGN KEY ("proposition_id") REFERENCES "public"."propositions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "synthesises" ADD CONSTRAINT "synthesises_discussion_id_discussions_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."discussions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "synthesises" ADD CONSTRAINT "synthesises_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "conv_pair_uniq" ON "conversations" USING btree ("entraide_id","a_id","b_id");--> statement-breakpoint
CREATE INDEX "email_queue_status_idx" ON "email_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "error_log_at_idx" ON "error_log" USING btree ("at");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "signalements_etat_idx" ON "signalements" USING btree ("etat");--> statement-breakpoint
CREATE INDEX "signalements_created_idx" ON "signalements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sms_queue_status_idx" ON "sms_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sms_queue_sched_idx" ON "sms_queue" USING btree ("scheduled_at");