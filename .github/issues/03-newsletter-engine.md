# Feature: Newsletter Engine - Weekly Scheduled Digests

## Description
Implement the newsletter engine that generates and sends weekly email digests to subscribers. This is the core communication feature of the IE237 API.

## Acceptance Criteria
- [ ] Create newsletter jobs/scheduled task system (cron or similar)
- [ ] Implement weekly newsletter generation:
  - [ ] Query subscribers with preferences matching content
  - [ ] Select published content from past week
  - [ ] Filter by subscriber topic preferences
  - [ ] Generate email content (HTML + plain text)
- [ ] Integrate with email service:
  - [ ] SendGrid API integration (or custom SMTP for MVP)
  - [ ] Send email to individual subscribers
  - [ ] Track sends via SendGrid events (opens, clicks)
- [ ] Create status endpoint:
  - [ ] `GET /api/newsletter/status` - returns last send, next scheduled
- [ ] Unsubscribe link inclusion in every newsletter (CAN-SPAM compliance)

## Technical Details
- **Schedule**: Weekly cron job (e.g., Sunday 09:00 UTC)
- **Email format**: HTML email with plain text alternative
- **Content selection**: Latest published content since last newsletter
- **Preferences**: Topic-based filtering (politics, technology, sports, business, etc.)
- **Compliance**: Unsubscribe link, physical address, CAN-SPAM requirements
- **SendGrid**: API key required, test mode available for development

## Dependencies
- [ ] Phase 1: Foundation - Database tables and API keys
- [ ] Phase 2: Core Features - RSS and subscriber system

## Definition of Done
- Weekly newsletter generates correctly with filtered content
- Emails send successfully via SendGrid (or SMTP)
- Unsubscribe link functional and respects requests
- Status endpoint shows last send and next schedule
- GDPR/CAN-SPAM compliant (unsubscribe processed, data retention noted)

## Notes
- SendGrid API key needed - can use test endpoint for MVP
- Consider adding email template design later
- Analytics tracking via SendGrid events optional Phase 5
- Can start with custom SMTP, migrate to SendGrid later