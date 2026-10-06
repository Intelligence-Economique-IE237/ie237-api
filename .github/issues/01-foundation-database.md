# Feature: Foundation - Database Tables and API Keys

## Description
Implement the foundational database tables and API key authentication system. This is the first phase of the IE237 API roadmap and provides the basis for all subsequent features.

## Acceptance Criteria
- [ ] Create `content` table with columns: id (UUID), title (TEXT), slug (TEXT, unique), type ('news'|'blog'), status ('draft'|'published'), content (TEXT), excerpt (TEXT), created_at (TIMESTAMP), updated_at (TIMESTAMP)
- [ ] Create `subscribers` table with columns: id (UUID), email (TEXT, unique), status ('active'|'unsubscribed'|'pending'), preferences_json (JSON), created_at (TIMESTAMP), unsubscribed_at (TIMESTAMP), last_newsletter_sent (TIMESTAMP)
- [ ] Create `api_keys` table with columns: id (UUID), key (TEXT, unique, hashed), permissions (JSON), created_at (TIMESTAMP), expires_at (TIMESTAMP, optional)
- [ ] Implement h3 middleware for API key authentication
- [ ] Create `POST /api/auth/api-key` endpoint
- [ ] Basic CRUD endpoints for content:
  - [ ] `POST /api/content` - Create news/blog post
  - [ ] `GET /api/news` - List published news (with limit, offset query params)
  - [ ] `GET /api/blogs` - List published blogs (with limit, offset query params)
  - [ ] `GET /api/content/:slug` - View single content item

## Technical Details
- **Database**: PostgreSQL with Drizzle ORM
- **Migration files**: Create in `server/database/` directory
- **Schema**: TypeScript types for all tables
- **Authentication**: API keys as primary mechanism (UUID format, hashed storage)
- **Endpoint prefixes**: All under `/api` route handlers

## Dependencies
- None (foundation phase)

## Definition of Done
- Database tables created and migrated
- API key authentication functional
- Basic content CRUD endpoints working (testable via curl or Postman)
- TypeScript types defined and exported

## Notes
- This phase has no dependencies - can be started immediately
- Consider adding row-level security policies for production
- API key permissions should be scoped install
<tool_call>
<function=bash>
<parameter=command>
brew install gh || true