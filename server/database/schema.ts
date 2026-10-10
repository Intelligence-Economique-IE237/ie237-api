import { isNotNull, sql } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	index,
	integer,
	pgEnum,
	pgTable,
	serial,
	smallint,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

// -----------------------------------------------------
// ULID generation helper (application-side)
// Use: import { v4 as uuidv4 } from 'uuid' or custom ULID generator
// For now, using serial auto-increment as placeholder
// -----------------------------------------------------

// Enum for content type
export const contentTypeEnum = pgEnum("type", ["news", "blog"]);

// Enum for content status
export const contentStatusEnum = pgEnum("content_status", [
	"draft",
	"published",
]);

// Enum for subscriber status
export const subscriberStatusEnum = pgEnum("subscriber_status", [
	"active",
	"unsubscribed",
	"pending",
]);

// Enum for RSS approval status
export const rssApprovalStatusEnum = pgEnum("rss_approval_status", [
	"pending",
	"approved",
	"rejected",
]);

// Enum for health check status
export const healthCheckStatusEnum = pgEnum("health_check_status", [
	"up",
	"down",
	"warning",
]);

// Enum for subscription status (reused)
export const subscriptionStatusEnum = pgEnum("subscription_status", [
	"active",
	"unsubscribed",
	"pending",
]);

// Enum for newsletter log status (alternate naming)
export const nlStatusEnum = pgEnum("newsletter_status", [
	"sent",
	"failed",
	"pending",
]);

// -----------------------------------------------------
// Content Table (Issue #1: Foundation)
// -----------------------------------------------------
export const categories = pgTable("categories", {
	slug: text().notNull().primaryKey(),
	title: text().notNull(),
	tags: text().array().default([]),
	createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", {
		mode: "date",
		withTimezone: true,
	})
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const content = pgTable(
	"content",
	{
		id: uuid().primaryKey().notNull().defaultRandom(),
		title: text("title").notNull(),
		slug: text("slug").notNull().unique(),
		type: contentTypeEnum("type").notNull(), // 'news' | 'blog'
		status: contentStatusEnum("status").notNull().default("draft"), // 'draft' | 'published'
		content: text("content"),
		language: text().notNull(),
		excerpt: text("excerpt"),
		isTranslationOf: uuid("is_translation_of"),
		createdAt: timestamp("created_at", { mode: "string" })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", {
			mode: "date",
			withTimezone: true,
		})
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
		tags: text().array(),
		category: text(),
		priority: smallint().default(0),
	},
	(t) => [
		index().on(t.updatedAt),
		index().on(t.createdAt),
		index("content_title_excerpt_idx").using(
			"gin",
			sql`to_tsvector('simple', coalesce(${t.title}, '') || ' ' || coalesce(${t.excerpt}, ''))`,
		),
		index("content_tags_idx").using("gin", t.tags),
		index().on(t.isTranslationOf).where(isNotNull(t.isTranslationOf)),
		index().on(t.language),
		index().on(t.category).where(isNotNull(t.category)),
		foreignKey({
			columns: [t.isTranslationOf],
			foreignColumns: [t.id],
		}).onDelete('cascade'),
		foreignKey({
			columns: [t.category],
			foreignColumns: [categories.slug],
		}).onDelete("set null"),
	],
);

// export const writers = pgTable("writers", {
// 	id: uuid().primaryKey().notNull().defaultRandom(),
// 	names: text().notNull(),
// 	avatar: text(),
// });

// export const writerLinks =

// export const contentAttachmentType = pgEnum('content_attachment_type', ['image', 'video'])
export const contentAttachments = pgTable(
	"content_attachment_groups",
	{
		urls: text().array().notNull().default([]),
		content: uuid().notNull(),
	},
	(t) => [
		index().on(t.content),
		foreignKey({
			columns: [t.content],
			foreignColumns: [content.id],
		}).onDelete("cascade"),
	],
);

// -----------------------------------------------------
// Subscribers Table (Part of Issue #1, full subscription system in Issue #2)
// -----------------------------------------------------

export const subscribers = pgTable("subscribers", {
	id: serial("id").primaryKey(),
	email: text("email").notNull().unique(),
	status: subscriberStatusEnum("status").notNull(), // 'active' | 'unsubscribed' | 'pending'
	preferences_json: text("preferences_json"),
	created_at: timestamp("created_at", { mode: "string" })
		.notNull()
		.defaultNow(),
	unsubscribed_at: timestamp("unsubscribed_at", { mode: "string" }),
	last_newsletter_sent: timestamp("last_newsletter_sent", { mode: "string" }),
});

// -----------------------------------------------------
// RSS Feeds Materialized View (for later phases)
// Using a materialized view for RSS since feed generation is
// typically a batch operation that doesn't need real-time data.
// The view is refreshed periodically via cron job or migration.
// -----------------------------------------------------
// SQL: CREATE MATERIALIZED VIEW rss_feeds_v AS
// SELECT id, name, description, config_json, last_built_at, is_active
// FROM rss_feeds_base;
// -----------------------------------------------------

// Base table for RSS feeds (populated by feed generation jobs)
export const rssFeedsBase = pgTable("rss_feeds_base", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	config_json: text("config_json"),
	last_built_at: timestamp("last_built_at", { mode: "string" }),
	is_active: text("is_active").notNull().default("false"), // 'true' | 'false'
});

// Materialized view for RSS feed reads (read-optimized)
export const rssFeeds = pgTable("rss_feeds_v", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	config_json: text("config_json"),
	last_built_at: timestamp("last_built_at", { mode: "string" }),
	is_active: text("is_active").notNull().default("false"), // 'true' | 'false'
});

// -----------------------------------------------------
// RSS Approvals Table (Issue #6 Phase 4)
// -----------------------------------------------------

export const rssApprovals = pgTable("rss_approvals", {
	id: serial("id").primaryKey(),
	feed_url: text("feed_url").notNull().unique(),
	status: rssApprovalStatusEnum("status").notNull(), // 'pending' | 'approved' | 'rejected'
	checked_at: timestamp("checked_at", { mode: "string" })
		.notNull()
		.defaultNow(),
	notes: text("notes"),
});

// -----------------------------------------------------
// Cleanup Log Table (Issue #6 Phase 4: Data Retention)
// -----------------------------------------------------

export const cleanupLog = pgTable("cleanup_log", {
	id: serial("id").primaryKey(),
	table_name: text("table_name").notNull(),
	row_id: integer("row_id").notNull(),
	deleted_at: timestamp("deleted_at", { mode: "string" }).notNull(),
	reason: text("reason"),
});

// -----------------------------------------------------
// Analytics Events Table (Issue #4 Alternative)
// -----------------------------------------------------

export const analyticsEvents = pgTable("analytics_events", {
	id: serial("id").primaryKey(),
	type: text("type").notNull(),
	path: text("path").notNull(),
	occurred_at: timestamp("occurred_at", { mode: "string" })
		.notNull()
		.defaultNow(),
	payload: text("payload"),
});

// -----------------------------------------------------
// Health Checks Table (Issue #4 Alternative)
// -----------------------------------------------------

export const healthChecks = pgTable("health_checks", {
	id: serial("id").primaryKey(),
	endpoint: text("endpoint").notNull(),
	status: healthCheckStatusEnum("status").notNull(), // 'up' | 'down' | 'warning'
	checked_at: timestamp("checked_at", { mode: "string" })
		.notNull()
		.defaultNow(),
	response_time_ms: integer("response_time_ms"),
});

// -----------------------------------------------------
// Subscriptions Table (Issue #2: Core Features)
// -----------------------------------------------------

export const subscriptions = pgTable("subscriptions", {
	id: serial("id").primaryKey(),
	email: text("email").notNull().unique(),
	status: subscriptionStatusEnum("status").notNull(), // 'active' | 'unsubscribed' | 'pending'
	token: text("token"),
	created_at: timestamp("created_at", { mode: "string" })
		.notNull()
		.defaultNow(),
	unsubscribed_at: timestamp("unsubscribed_at", { mode: "string" }),
});

// -----------------------------------------------------
// Newsletter Templates Table (Issue #3)
// -----------------------------------------------------

export const newsletterTemplates = pgTable("newsletter_templates", {
	id: serial("id").primaryKey(),
	name: text("name").notNull().unique(),
	subject: text("subject").notNull(),
	content: text("content").notNull(),
	is_html: boolean("is_html").default(true),
	created_at: timestamp("created_at", { mode: "string" })
		.notNull()
		.defaultNow(),
	updated_at: timestamp("updated_at", { mode: "string" })
		.notNull()
		.defaultNow(),
});

// -----------------------------------------------------
// Newsletter Logs Table (Issue #3)
// -----------------------------------------------------

export const newsletterLogs = pgTable("newsletter_logs", {
	id: serial("id").primaryKey(),
	template_id: integer("template_id").notNull(),
	subscriber_id: integer("subscriber_id").notNull(),
	sent_at: timestamp("sent_at", { mode: "string" }).notNull().defaultNow(),
	status: nlStatusEnum("status").notNull(), // 'sent' | 'failed' | 'pending'
	error_message: text("error_message"),
});

// -----------------------------------------------------
// Database export types
// -----------------------------------------------------

export type Content = typeof content.$inferSelect;
export type Subscribers = typeof subscribers.$inferSelect;
export type RssFeeds = typeof rssFeeds.$inferSelect;
export type AnalyticsEvents = typeof analyticsEvents.$inferSelect;
export type HealthChecks = typeof healthChecks.$inferSelect;
export type Subscriptions = typeof subscriptions.$inferSelect;
export type NewsletterTemplates = typeof newsletterTemplates.$inferSelect;
export type NewsletterLogs = typeof newsletterLogs.$inferSelect;
