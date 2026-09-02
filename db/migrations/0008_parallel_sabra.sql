CREATE TYPE "public"."staff_application_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_id" uuid NOT NULL,
	"token" text NOT NULL,
	"contact_target" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "staff_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"team" text,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"invited_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "staff_invitations_email_unique" UNIQUE("email"),
	CONSTRAINT "staff_invitations_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "staff_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_code" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"team" text NOT NULL,
	"password_hash" text,
	"status" "staff_application_status_enum" DEFAULT 'PENDING' NOT NULL,
	"rejection_reason" text,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "staff_applications_reference_code_unique" UNIQUE("reference_code")
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"reset_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "access_token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "pr_channel" text;--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_invitations" ADD CONSTRAINT "staff_invitations_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_applications" ADD CONSTRAINT "staff_applications_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_verification_tokens_token" ON "verification_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_verification_tokens_reg_id" ON "verification_tokens" USING btree ("registration_id");--> statement-breakpoint
CREATE INDEX "staff_applications_email_idx" ON "staff_applications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "staff_applications_status_created_at_idx" ON "staff_applications" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "staff_applications_pending_email_unique" ON "staff_applications" USING btree ("email") WHERE "staff_applications"."status" = 'PENDING';--> statement-breakpoint
CREATE INDEX "rate_limits_reset_at_idx" ON "rate_limits" USING btree ("reset_at");--> statement-breakpoint
CREATE INDEX "idx_time_slots_event_active" ON "time_slots" USING btree ("event_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_registrations_event_id" ON "registrations" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_registrations_event_status" ON "registrations" USING btree ("event_id","status");--> statement-breakpoint
CREATE INDEX "idx_registrations_event_source" ON "registrations" USING btree ("event_id","source");--> statement-breakpoint
CREATE INDEX "idx_registrations_slot_id" ON "registrations" USING btree ("slot_id");--> statement-breakpoint
CREATE INDEX "idx_registrations_registered_at" ON "registrations" USING btree ("registered_at");--> statement-breakpoint
CREATE INDEX "idx_registrations_access_token" ON "registrations" USING btree ("access_token");--> statement-breakpoint
CREATE INDEX "idx_waitlist_slot_status" ON "waitlist" USING btree ("slot_id","status");--> statement-breakpoint
CREATE INDEX "idx_waitlist_event_phone" ON "waitlist" USING btree ("event_id","phone_normalized");--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_access_token_unique" UNIQUE("access_token");