# Feature: Core Features - RSS Feed and Subscriber System

## Description
Implement the RSS feed generation system and subscriber management. This phase builds on the foundation database and authentication from Phase 1.

## Acceptance Criteria
- [ ] Create RSS feeds table with columns: id (UUID), name (TEXT), description (TEXT), config_json (JSON), last_built_at (TIMESTAMP), is_active (BOOLEAN)
- [ ] Implement `GET /api/rss` endpoint - auto-generates RSS XML from latest published content
- [ ] Implement `GET /api/rss/:feedName` endpoint - specific feed by name
- [ ] Configure RSS generation: categories, item limit (default 10), content types (news/blog)
- [ ] Create subscriber API endpoints:
  - [ ] `POST /api/newsletter/subscribe` - subscribe with email and optional preferences
  - [ ] `POST /api/newsletter/unsubscribe` - unsubscribe by email
- [ ] Implement basic preference filtering for newsletter content
- [ ] API key authentication for subscriber endpoints (optional for MVP)

## Technical Details
- **RSS XML**: Standard RSS 2.0 format with channel and items
- **Content filtering**: Filter by topic preferences and content type
- **Schedule**: Cron job setup for weekly generation (can be manual trigger for MVP)
- **Configuration**: RSS config stored in database JSON field
- **Endpoint prefixes**: All under `/api` route handlers

## Dependencies
- [ ] Phase 1: Foundation - Database tables and API keys

## Definition of Done
- RSS feed generating correct XML from content database
- Subscribers can opt-in and opt-out via API
- Preference filtering works (topic-based content selection)
- RSS endpoints return valid RSS 2.0 format

## Notes
- RSS currently open (no auth required) for MVP, can add auth later
- Cron job can be triggered manually for development/testing
- Consider adding RSS approval workflow in Phase 4
- Test with sample content created in Phase 1