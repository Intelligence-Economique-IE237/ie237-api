# Feature: RSS Approval Workflow and Data Retention Cleanup

## Description
Implement the RSS user approval workflow and automated data retention cleanup jobs. These features ensure compliance and curated content publication.

## Acceptance Criteria - RSS Approval
- [ ] Implement RSS approval workflow:
  - [ ] `POST /api/rss/approve` endpoint - marks RSS feed for publication
  - [ ] Admin authentication required (API key with admin permissions)
  - [ ] Approval pauses auto-generation, waits for manual approval
  - [ ] Published RSS feed updates last_built_at timestamp
- [ ] RSS configuration API:
  - [ ] Endpoint to update feed categories
  - [ ] Endpoint to adjust item limit
  - [ ] Endpoint to toggle is_active status

## Acceptance Criteria - Data Retention
- [ ] Implement 3-year subscriber data retention policy
- [ ] Create cleanup_log table for audit trail:
  - [ ] table_name (TEXT)
  - [ ] operation (TEXT)
  - [ ] record_count (INTEGER)
  - [ ] ran_at (TIMESTAMP)
  - [ ] initiated_by (TEXT)
  - [ ] notes (TEXT)
- [ ] Implement cleanup job:
  - [ ] Delete subscribers past 3 years with status 'unsubscribed'
  - [ ] Export subscriber data before deletion (GDPR right to be forgotten)
  - [ ] Run weekly or monthly scheduled task
- [ ] Implement draft content cleanup:
  - [ ] Delete draft content older than 90 days of inactivity
  - [ ] Run as separate job from subscriber cleanup

## Technical Details
- **RSS Approval**: h3 middleware to check API key permissions
- **Cleanup SQL**: PostgreSQL queries with proper WHERE clauses
- **Logging**: Every cleanup run inserts record into cleanup_log table
- **Export before delete**: Offer JSON/CSV export of data before automated deletion
- **Schedule**: Cron jobs (weekly for subscribers, separate for drafts)

## Dependencies
- [ ] Phase 1: Foundation - Database tables and API keys
- [ ] Phase 2: Core Features - RSS and subscriber system
- [ ] Phase 3: Newsletter Engine - subscriber data to manage

## Definition of Done
- RSS can be approved for publication via API
- Cleanup jobs run without errors
- Audit log records every cleanup operation
- Data export functional before deletion
- 3-year retention policy automated

## Notes
- Approval workflow prevents accidental RSS publication
- Cleanup can be disabled in development mode
- Export functionality important for GDPR compliance
- Consider adding admin UI for manual cleanup triggers