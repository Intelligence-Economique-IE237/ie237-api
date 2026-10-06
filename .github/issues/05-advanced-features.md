# Feature: Advanced Features - Tagging, Search, and Optional Auth

## Description
Implement advanced features including content tagging, search functionality, and optional user authentication. These can be added after MVP launch.

## Acceptance Criteria - Content Tagging
- [ ] Add `tags` column to content table (JSON array of topic strings)
- [ ] Populate tags for existing content (retroactive or via admin)
- [ ] Tag-based filtering in RSS and newsletter generation

## Acceptance Criteria - Search
- [ ] Implement `GET /api/search` endpoint
- [ ] Search query params: q (search term), tags (array), type (news/blog)
- [ ] Full-text search or fuzzy matching on title and excerpt
- [ ] Return array of matching content items

## Acceptance Criteria - Optional User Auth
- [ ] Create `users` table (id, email, password_hash, role, created_at)
- [ ] Implement `POST /api/auth/login` endpoint
- [ ] Implement `POST /api/auth/register` endpoint
- [ ] Implement `GET /api/auth/me` endpoint (protected)
- [ ] API keys can coexist with user authentication

## Technical Details
- **Tag system**: JSON array on content table, e.g., `["technology", "local", "politics"]`
- **Search**: LIKE queries on title and excerpt, or PostgreSQL full-text search
- **User roles**: 'user' and 'admin' roles for different permission levels
- **Auth coexistence**: API keys primary, user auth secondary for admin operations

## Dependencies
- [ ] Phase 1: Foundation - Database tables and API keys
- [ ] Phase 2: Core Features - Content model to tag
- [ ] Phase 3: Newsletter Engine - Optional for preference filtering

## Definition of Done
- Content can be tagged with topics
- Search endpoint returns relevant results
- User authentication functional (login/register)
- API keys still work alongside user auth
- Tag filtering works in RSS/ newsletter generation

## Notes
- These features optional for MVP - can launch without
- Tag system simple to implement post-launch
- Search can use basic LIKE queries initially
- User auth can be added when admin UI needed
- Consider adding full-text search later with PostgreSQL pg_search

## Phase 5 Label
- Optional - add after MVP if needed
- Low priority if API keys suffice