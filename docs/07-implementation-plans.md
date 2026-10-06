# IE237 API - Implementation Plans

## Overview
This document outlines the implementation plans for all 7 GitHub issues in the IE237 API roadmap. The plans identify parallelizable work and respect the dependency chain between phases.

**Branch**: `f/implementation-plans`
**Roadmap Order**: #1 → #2 → #3 → #4 → #5 → #6 → #7
**Issue Types**: All use `type=Task`

---

## Issue #1: Foundation: Database Tables and API Keys
**Status**: First phase - no dependencies
**Labels**: `task`, `foundation`

### Parallelizable Work
- ✅ **Database schema design** can be done in parallel with API design
- ✅ **Migration file creation** is self-contained
- ✅ **TypeScript type definitions** can be drafted early

### Implementation Plan
1. **Database Tables** (Priority: High)
   - Create `content` table with columns: id (UUID), title (TEXT), slug (TEXT, unique), type ('news'|'blog'), status ('draft'|'published'), content (TEXT), excerpt (TEXT), created_at (TIMESTAMP), updated_at (TIMESTAMP)
   - Create `subscribers` table with columns: id (UUID), email (TEXT, unique), status ('active'|'unsubscribed'|'pending'), preferences_json (JSON), created_at (TIMESTAMP), unsubscribed_at (TIMESTAMP), last_newsletter_sent (TIMESTAMP)
   - Create `api_keys` table with columns: id (UUID), key (TEXT, unique, hashed), permissions (JSON), created_at (TIMESTAMP), expires_at (TIMESTAMP, optional)

2. **H3 Middleware** (Priority: High)
   - Implement API key authentication middleware for h3
   - Support UUID format keys
   - Hash storage for security

3. **API Endpoints** (Priority: Medium - depends on tables)
   - `POST /api/auth/api-key` - API key authentication
   - `POST /api/content` - Create news/blog post
   - `GET /api/news` - List published news (with limit, offset)
   - `GET /api/blogs` - List published blogs (with limit, offset)
   - `GET /api/content/:slug` - View single content item

4. **Definition of Done**
   - [ ] Database tables created and migrated
   - [ ] API key authentication functional
   - [ ] Basic content CRUD endpoints working
   - [ ] TypeScript types defined and exported

### Estimated Effort
- **Database + Types**: 2-3 days
- **Middleware**: 2 days
- **Endpoints**: 3-4 days
- **Total**: ~1 week (can start immediately)

---

## Issue #2: Core Features: RSS Subscribers Management
**Status**: Depends on Issue #1 completion
**Labels**: `task`, `subscribers`

### Parallelizable Work (with Issue #1)
- Can start **database migration** once #1 tables are created
- Can parallelize **subscription form design** with #1 endpoint work

### Implementation Plan
1. **Subscriptions Table** (Priority: High - depends on #1)
   - Create `subscriptions` table with columns: id (UUID), email (TEXT, unique), status ('active'|'unsubscribed'|'pending'), token (TEXT), created_at (TIMESTAMP), unsubscribed_at (TIMESTAMP)

2. **Subscription Management Endpoints** (Priority: High - depends on #1)
   - `POST /api/subscriptions` - Subscribe/new subscriber
   - `GET /api/subscriptions` - List all subscribers (management)
   - Email validation and duplicate prevention

3. **Newsletter Sending** (Priority: Medium - depends on #1+#2)
   - `POST /api/newsletter` - Send newsletters
   - Test email functionality

4. **Definition of Done**
   - [ ] Subscriptions table created and migrated
   - [ ] Subscription management API endpoints functional
   - [ ] Newsletter sending endpoint working
   - [ ] Email validation and deduplication implemented

### Estimated Effort
- **Table + Migration**: 2 days (after #1)
- **Endpoints**: 3-4 days
- **Newsletter**: 2-3 days
- **Total**: ~1 week (starts after #1 foundation)

---

## Issue #3: Newsletter Engine: Core Functionality
**Status**: Depends on Issue #2 completion
**Labels**: `task`, `newsletter`

### Parallelizable Work (with Issue #2)
- Can start **template design** while #2 endpoints are being finalized
- Can parallelize **log table creation** with subscription work

### Implementation Plan
1. **Newsletter Tables** (Priority: High - depends on #2)
   - Create `newsletter_templates` table: id (UUID), name (TEXT, unique), subject (TEXT), content (TEXT), is_html (BOOLEAN), created_at (TIMESTAMP), updated_at (TIMESTAMP)
   - Create `newsletter_logs` table: id (UUID), template_id (UUID), subscriber_id (UUID), sent_at (TIMESTAMP), status ('sent'|'failed'|'pending'), error_message (TEXT)

2. **Template Management** (Priority: Medium - depends on table)
   - `POST /api/newsletter` - Create and send newsletters
   - `GET /api/newsletter/templates` - List templates

3. **Scheduling & Plain Text** (Priority: Medium)
   - Newsletter scheduling functionality
   - Generate plain text version from HTML templates

4. **Definition of Done**
   - [ ] Newsletter templates table created and migrated
   - [ ] Newsletter sending endpoint functional
   - [ ] Newsletter logs tracking implemented
   - [ ] Template management API working

### Estimated Effort
- **Tables + Migration**: 2-3 days (after #2)
- **Endpoints**: 3 days
- **Templates + Scheduling**: 2-3 days
- **Total**: ~1 week (starts after #2)

---

## Issue #4: Advanced Features: Analytics and Monitoring
**Status**: Depends on Issue #3 completion
**Labels**: `task`, `advanced`

### Parallelizable Work (with Issue #3)
- Can start **health check design** while #3 endpoints are being finalized
- Can parallelize **analytics events table** with newsletter logs

### Implementation Plan
1. **Analytics Tables** (Priority: High - depends on #3)
   - Create `analytics_events` table: id (UUID), type (TEXT), path (TEXT), occurred_at (TIMESTAMP), payload (JSON)
   - Create `health_checks` table: id (UUID), endpoint (TEXT), status (TEXT), checked_at (TIMESTAMP), response_time_ms (INTEGER)

2. **API Endpoints** (Priority: Medium - depends on tables)
   - `GET /api/analytics` - Retrieve usage statistics
   - `GET /api/health` - Health checks

3. **Request Logging** (Priority: Medium)
   - Middleware for request logging
   - Performance metrics collection

4. **Definition of Done**
   - [ ] Analytics events table created and migrated
   - [ ] Health check endpoints functional
   - [ ] Analytics retrieval API working
   - [ ] Request logging middleware implemented

### Estimated Effort
- **Tables + Migration**: 2-3 days (after #3)
- **Endpoints**: 2-3 days
- **Logging + Metrics**: 2 days
- **Total**: ~1 week (starts after #3)

---

## Issue #5: Coolify Deployment: Docker and Configuration
**Status**: Depends on Issue #4 completion
**Labels**: `task`, `deployment`

### Parallelizable Work (with Issue #4)
- Can start **Dockerfile design** while #4 tables are being created
- Can parallelize **environment variable configuration** with health check work

### Implementation Plan
1. **Docker Configuration** (Priority: High - depends on #4)
   - Create Dockerfile for the application
   - Create docker-compose.yml for Coolify deployment
   - Multi-stage Docker build

2. **Environment Configuration** (Priority: High - depends on #4)
   - Configure environment variables for production
   - Set up PostgreSQL connection via environment variables
   - Configure API key authentication in production

3. **Health Checks** (Priority: Medium - depends on #4+#5)
   - Implement health check endpoint for Coolify
   - Test deployment locally with Docker

4. **Definition of Done**
   - [ ] Dockerfile created and tested
   - [ ] docker-compose.yml configured for Coolify
   - [ ] Environment variables documented
   - [ ] Health check endpoint functional
   - [ ] Local Docker deployment working

### Estimated Effort
- **Docker + Compose**: 3-4 days (after #4)
- **Environment Config**: 2-3 days
- **Health Checks + Testing**: 2-3 days
- **Total**: ~1.5 weeks (starts after #4)

---

## Issue #6: RSS Approval Cleanup: Validation and Quality
**Status**: Depends on Issue #5 completion
**Labels**: `task`, `rss`

### Parallelizable Work (with Issue #5)
- Can start **RSS feed validation design** while #5 Docker work proceeds
- Can parallelize **approval table creation** with environment config

### Implementation Plan
1. **RSS Approval Table** (Priority: High - depends on #5)
   - Create `rss_approvals` table: id (UUID), feed_url (TEXT, unique), status ('pending'|'approved'|'rejected'), checked_at (TIMESTAMP), notes (TEXT)

2. **RSS Feed Endpoints** (Priority: Medium - depends on #5)
   - `POST /api/rss/approve` - Approve/reject RSS feeds
   - `GET /api/rss/feeds` - List RSS feeds with approval status

3. **Validation & Detection** (Priority: Medium)
   - RSS feed validation and sanitization
   - Duplicate feed detection
   - Automatic cleanup of expired RSS entries

4. **Definition of Done**
   - [ ] RSS approvals table created and migrated
   - [ ] RSS feed validation implemented
   - [ ] Approval management API endpoints working
   - [ ] Duplicate detection functional

### Estimated Effort
- **Table + Migration**: 2-3 days (after #5)
- **Endpoints**: 3 days
- **Validation + Detection**: 2-3 days
- **Total**: ~1 week (starts after #5)

---

## Issue #7: Implementation Roadmap: Project Planning and Milestones
**Status**: Depends on all previous issues completion
**Labels**: `task`, `roadmap`

### Parallelizable Work
- Can start **roadmap documentation** updating while earlier phases are finalized
- Can parallelize **milestone tracking** setup with final phase work

### Implementation Plan
1. **Roadmap Documentation** (Priority: Medium - depends on all phases)
   - Update `.github/issues/07-IMPLEMENTATION_ROADMAP.md` with current phase status
   - Create visual roadmap representation

2. **Milestone Tracking** (Priority: Medium - depends on all phases)
   - Implement progress tracking against roadmap milestones
   - Set up regular roadmap review cadence

3. **Issue Linking** (Priority: Low - depends on all phases)
   - Link roadmap items to corresponding GitHub issues
   - Create milestone numbers for each phase

4. **Definition of Done**
   - [ ] Roadmap documentation updated and maintained
   - [ ] Milestones tracked for all phases
   - [ ] Progress visible and reviewable
   - [ ] Roadmap items linked to GitHub issues

### Estimated Effort
- **Documentation**: 1-2 days (can start early, update continuously)
- **Milestone Tracking**: 2-3 days (after major phases)
- **Linking + Review**: 1 day
- **Total**: ~1 week (starts after #6, but documentation can be ongoing)

---

## Parallel Work Summary

### What Can Truly Run in Parallel:
| Workstream | Parallel With | Notes |
|------------|--------------|-------|
| **Database Design** | API Design | Can sketch schemas while designing endpoints |
| **TypeScript Types** | Migration Files | Types can be drafted early, refined with migrations |
| **Middleware** | Endpoint Implementation | Auth middleware can be built alongside routes |
| **Documentation** | Development | Docs can be written/updated as work progresses |
| **Environment Config** | Docker Setup | Env vars can be planned while Docker is built |

### Dependency Chain (Critical Path):
```
#1 Foundation → #2 Subscribers → #3 Newsletter → #4 Analytics → #5 Deployment → #6 RSS → #7 Roadmap
```
Each phase must complete before the next can start fully, but **preparatory work** for subsequent phases can begin early.

### Recommended Parallel Workstreams:
1. **Workstream A (Foundation)**: Issue #1 - Full focus, no dependencies
2. **Workstream B (Preparation)**: While #1 is ongoing, design issues #2-#7 tables and endpoints
3. **Workstream C (Documentation)**: Continuously update docs/07-implementation-plans.md
4. **Workstream D (Review)**: Regular reviewer agent check-ins on plan progress

### Review Checkpoints
- **After Issue #1**: Review database schema and API key design
- **After Issue #2**: Review subscription management and newsletter start
- **After Issue #3**: Review newsletter engine and analytics begin
- **After Issue #4**: Review analytics and deployment planning
- **After Issue #5**: Review Docker/Coolify configuration
- **After Issue #6**: Review RSS approval and quality processes
- **After Issue #7**: Final roadmap review and documentation audit