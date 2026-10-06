# IE237 API - Project Overview

## Project Mission
API for an information system supporting RSS, newsletters, news, and blogs. Built with Nitro v3, h3, Rolldown, Drizzle ORM, and PostgreSQL.

## Core Features
- **News**: Published news items with categorization
- **Blogs**: Long-form content posts
- **RSS Feeds**: Auto-generated and configurable feeds
- **Newsletters**: Weekly scheduled email digests to subscribers

## Technology Stack
- **Framework**: Nitro v3 (Vue/Nitro build)
- **Server**: h3 HTTP framework
- **Build**: Rolldown
- **ORM**: Drizzle ORM with PostgreSQL
- **Language**: TypeScript

## Development Conventions
- Feature branches: `f/` prefix (e.g., `f/add-rss-endpoint`)
- Bug fix branches: `b/` prefix (e.g., `b/fix-null-reference`)
- Documentation in `docs/` directory
- All markdown files for developer/agent knowledge base

## System Design Decisions
- **Newsletter schedule**: Weekly, consistent notifications
- **Content model**: Unified content table with type discriminator
- **RSS architecture**: Auto-generated with manual channel configuration and user approval
- **Email service**: SendGrid hybrid (delivery + custom tracking)
- **Data retention**: 3 years subscriber data with automated cleanup
- **Authentication**: API keys primary, optional user auth and OAuth

## Branch Naming Conventions
- Features: `f/feature-description`
- Bug fixes: `b/bug-description`