-- Migration: 001-foundation
-- Description: Create foundational database tables for IE237 API
-- Phase 1: Foundation - Database Tables and API Keys

-- -----------------------------------------------------
-- Content Table
-- -----------------------------------------------------
CREATE TABLE content (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('news', 'blog')),
    status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
    content TEXT NOT NULL,
    excerpt TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------
-- Subscribers Table (Foundation - basic structure)
-- -----------------------------------------------------
CREATE TABLE subscribers (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'unsubscribed', 'pending')),
    preferences_json JSON,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    unsubscribed_at TIMESTAMP,
    last_newsletter_sent TIMESTAMP
);

-- -----------------------------------------------------
-- API Keys Table
-- -----------------------------------------------------
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    permissions JSON,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- -----------------------------------------------------
-- Indexes
-- -----------------------------------------------------
CREATE INDEX idx_content_slug ON content(slug);
CREATE INDEX idx_content_type_status ON content(type, status);
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_status ON subscribers(status);
