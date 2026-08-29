CREATE TYPE "public"."staff_application_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');
--> statement-breakpoint
CREATE TABLE "staff_applications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "reference_code" text NOT NULL,
  "email" text NOT NULL,
  "display_name" text NOT NULL,
  "team" text NOT NULL,
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
ALTER TABLE "staff_applications" ADD CONSTRAINT "staff_applications_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "staff_applications_email_idx" ON "staff_applications" USING btree ("email");
--> statement-breakpoint
CREATE INDEX "staff_applications_status_created_at_idx" ON "staff_applications" USING btree ("status", "created_at");
--> statement-breakpoint
CREATE UNIQUE INDEX "staff_applications_pending_email_unique" ON "staff_applications" USING btree ("email") WHERE "staff_applications"."status" = 'PENDING';
