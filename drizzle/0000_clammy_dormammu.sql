CREATE TYPE "public"."axis" AS ENUM('comprehension', 'generation', 'translation', 'knowledge', 'official_documents', 'safety');--> statement-breakpoint
CREATE TYPE "public"."dialect_region" AS ENUM('baghdadi', 'southern', 'maslawi', 'mixed', 'msa');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."question_format" AS ENUM('multiple_choice', 'open_generation', 'extraction');--> statement-breakpoint
CREATE TYPE "public"."run_status" AS ENUM('imported', 'verified', 'published', 'retracted');--> statement-breakpoint
CREATE TYPE "public"."contamination_tier" AS ENUM('public_dev', 'private_test');--> statement-breakpoint
CREATE TYPE "public"."track" AS ENUM('arabic', 'iraqi');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('viewer', 'maintainer', 'admin');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "axis_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"run_id" integer NOT NULL,
	"track" "track" NOT NULL,
	"axis" "axis" NOT NULL,
	"tier" "contamination_tier" NOT NULL,
	"score" real NOT NULL,
	"ci_low" real,
	"ci_high" real,
	"n_items" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "benchmark_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(32) NOT NULL,
	"description" text,
	"is_frozen" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "benchmark_versions_label_unique" UNIQUE("label")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"run_id" integer NOT NULL,
	"verification_hash" varchar(64) NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	CONSTRAINT "certificates_run_id_unique" UNIQUE("run_id"),
	CONSTRAINT "certificates_verification_hash_unique" UNIQUE("verification_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "evaluation_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_id" integer NOT NULL,
	"version_id" integer NOT NULL,
	"completed_at" timestamp NOT NULL,
	"harness_commit" varchar(64) NOT NULL,
	"config" jsonb NOT NULL,
	"status" "run_status" DEFAULT 'imported' NOT NULL,
	"imported_by" integer,
	"imported_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"version_id" integer NOT NULL,
	"item_id" varchar(64) NOT NULL,
	"track" "track" NOT NULL,
	"axis" "axis" NOT NULL,
	"question_format" "question_format" NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"dialect_region" "dialect_region" NOT NULL,
	"prompt" text NOT NULL,
	"context" text,
	"payload" jsonb NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"imported_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "models" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"developer" varchar(128) NOT NULL,
	"parameters" varchar(32),
	"license" varchar(128),
	"source" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "private_item_manifest" (
	"id" serial PRIMARY KEY NOT NULL,
	"version_id" integer NOT NULL,
	"item_id" varchar(64) NOT NULL,
	"track" "track" NOT NULL,
	"axis" "axis" NOT NULL,
	"question_format" "question_format" NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"dialect_region" "dialect_region" NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"imported_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" text NOT NULL,
	"name" text,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_signed_in" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "axis_results" ADD CONSTRAINT "axis_results_run_id_evaluation_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."evaluation_runs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "certificates" ADD CONSTRAINT "certificates_run_id_evaluation_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."evaluation_runs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evaluation_runs" ADD CONSTRAINT "evaluation_runs_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evaluation_runs" ADD CONSTRAINT "evaluation_runs_version_id_benchmark_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."benchmark_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evaluation_runs" ADD CONSTRAINT "evaluation_runs_imported_by_users_id_fk" FOREIGN KEY ("imported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "items" ADD CONSTRAINT "items_version_id_benchmark_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."benchmark_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "private_item_manifest" ADD CONSTRAINT "private_item_manifest_version_id_benchmark_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."benchmark_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "axis_results_unique" ON "axis_results" USING btree ("run_id","track","axis","tier");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "items_version_item_unique" ON "items" USING btree ("version_id","item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "items_axis_idx" ON "items" USING btree ("axis");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "items_region_idx" ON "items" USING btree ("dialect_region");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "models_name_dev_unique" ON "models" USING btree ("name","developer");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "manifest_version_item_unique" ON "private_item_manifest" USING btree ("version_id","item_id");
