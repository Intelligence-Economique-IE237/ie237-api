CREATE TYPE "content_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "type" AS ENUM('news', 'blog');--> statement-breakpoint
CREATE TYPE "health_check_status" AS ENUM('up', 'down', 'warning');--> statement-breakpoint
CREATE TYPE "newsletter_status" AS ENUM('sent', 'failed', 'pending');--> statement-breakpoint
CREATE TYPE "rss_approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "subscriber_status" AS ENUM('active', 'unsubscribed', 'pending');--> statement-breakpoint
CREATE TYPE "subscription_status" AS ENUM('active', 'unsubscribed', 'pending');--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY,
	"type" text NOT NULL,
	"path" text NOT NULL,
	"occurred_at" timestamp DEFAULT now() NOT NULL,
	"payload" text
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"slug" text PRIMARY KEY,
	"title" text NOT NULL,
	"tags" text[] DEFAULT '{}'::text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cleanup_log" (
	"id" serial PRIMARY KEY,
	"table_name" text NOT NULL,
	"row_id" integer NOT NULL,
	"deleted_at" timestamp NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"type" "type" NOT NULL,
	"status" "content_status" DEFAULT 'draft'::"content_status" NOT NULL,
	"content" text NOT NULL,
	"language" text NOT NULL,
	"excerpt" text,
	"is_translation_of" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tags" text[],
	"category" text
);
--> statement-breakpoint
CREATE TABLE "content_attachment_groups" (
	"urls" text[] DEFAULT '{}'::text[] NOT NULL,
	"content" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "health_checks" (
	"id" serial PRIMARY KEY,
	"endpoint" text NOT NULL,
	"status" "health_check_status" NOT NULL,
	"checked_at" timestamp DEFAULT now() NOT NULL,
	"response_time_ms" integer
);
--> statement-breakpoint
CREATE TABLE "newsletter_logs" (
	"id" serial PRIMARY KEY,
	"template_id" integer NOT NULL,
	"subscriber_id" integer NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"status" "newsletter_status" NOT NULL,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "newsletter_templates" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"subject" text NOT NULL,
	"content" text NOT NULL,
	"is_html" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rss_approvals" (
	"id" serial PRIMARY KEY,
	"feed_url" text NOT NULL UNIQUE,
	"status" "rss_approval_status" NOT NULL,
	"checked_at" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "rss_feeds_v" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"description" text,
	"config_json" text,
	"last_built_at" timestamp,
	"is_active" text DEFAULT 'false' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rss_feeds_base" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"description" text,
	"config_json" text,
	"last_built_at" timestamp,
	"is_active" text DEFAULT 'false' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" serial PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"status" "subscriber_status" NOT NULL,
	"preferences_json" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp,
	"last_newsletter_sent" timestamp
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"status" "subscription_status" NOT NULL,
	"token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "content_title_excerpt_idx" ON "content" USING gin (to_tsvector('simple', coalesce("title", '') || ' ' || coalesce("excerpt", '')));--> statement-breakpoint
CREATE INDEX "content_tags_idx" ON "content" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "content_is_translation_of_index" ON "content" ("is_translation_of") WHERE ("is_translation_of" is not null);--> statement-breakpoint
CREATE INDEX "content_language_index" ON "content" ("language");--> statement-breakpoint
CREATE INDEX "content_category_index" ON "content" ("category") WHERE ("category" is not null);--> statement-breakpoint
CREATE INDEX "content_attachment_groups_content_index" ON "content_attachment_groups" ("content");