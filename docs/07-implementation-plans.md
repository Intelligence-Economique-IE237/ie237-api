# IE237 API - Implementation Plans

## Overview
This document outlines the implementation plans for all 7 GitHub issues in the IE237 API roadmap. The plans identify parallelizable work and respect the dependency chain between phases.

**⚠️ IMPORTANT ALIGNMENT NOTE**: The 7-issue critical path below diverges from the project's actual GitHub roadmap, which defines only 5 phases (see the "Roadmap Alignment" section below). The team should choose one structure and ensure consistency.

**Branch**: `f/implementation-plans`
**Roadmap Order (7 issues)**: #1 → #2 → #3 → #4 → #5 → #6 → #7
**Roadmap Order (5 phases, GitHub)**: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
**Issue Types**: All use `type=Task`

### Roadmap Alignment

| GitHub Roadmap (5 phases) | Implementation Plans (7 issues) | Mapping Status | Action |
|---------------------------|----------------------------------|----------------|--------|
| **Phase 1: Foundation** - Database tables and API keys | Issue #1: Foundation: Database Tables and API Keys | ✅ Exact match | Proceed as planned |
| **Phase 2: Core Features** - RSS and subscriber system | Issue #2: Core Features: RSS Subscribers Management | ✅ Exact match | Proceed as planned |
| **Phase 3: Newsletter Engine** - Weekly newsletter generation | Issue #3: Newsletter Engine: Core Functionality | ✅ Exact match | Proceed as planned |
| **Phase 4: RSS Approval Workflow + Data Retention Cleanup** | Issue #4: Advanced Features: Analytics and Monitoring | ❌ **Mismatch** - Different scope | See Issue #4 notes below |
| N/A | Issue #5: Coolify Deployment: Docker and Configuration | ❌ **Not in roadmap** - Operational concern | See Issue #5 notes below |
| N/A | Issue #6: RSS Approval Cleanup: Validation and Quality | ⚠️ **Partial overlap** - Narrower scope than Phase 4 | See Issue #6 notes below |
| N/A | Issue #7: Implementation Roadmap: Project Planning and Milestones | ❌ **Not in roadmap** - Meta/documentation task | See Issue #7 notes below |

**Decision needed**: Either (A) align the 7 issues with the 5 GitHub phases by merging/removing issues, or (B) update the GitHub roadmap to include the new phases (Analytics, Deployment, Roadmap Documentation).

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

**Roadmap Alignment**: ✅ Maps to GitHub Phase 1 - No changes needed. This is the correct starting point.

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

### ⚠️ Phase Alignment Note
**This issue does NOT map to the GitHub roadmap's Phase 4.** 

- **GitHub Phase 4**: "RSS Approval Workflow and Data Retention Cleanup" (includes 3-year subscriber retention policy, cleanup_log table, weekly cleanup jobs, GDPR compliance)
- **Issue #4 as written**: "Advanced Features: Analytics and Monitoring" (analytics events table, health checks, request logging)

**Team decision needed**: Either re-scope Issue #4 to match GitHub Phase 4, or update the GitHub roadmap to include an Analytics phase.

### Parallelizable Work (with Issue #3)
- Can start **health check design** while #3 endpoints are being finalized
- Can parallelize **analytics events table** with newsletter logs

### Implementation Plan (Issue #4 as Written - Analytics)
_If proceeding with Analytics scope:_

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

### Alternative: GitHub Phase 4 Scope (RSS Approval + Data Retention)
_If aligning with GitHub Phase 4 instead:_

1. **RSS Approvals Table** (Priority: High)
   - Create `rss_approvals` table: id (UUID), feed_url (TEXT, unique), status ('pending'|'approved'|'rejected'), checked_at (TIMESTAMP), notes (TEXT)

2. **Data Retention & Cleanup** (Priority: High)
   - Create `cleanup_log` table: id (UUID), table_name (TEXT), row_id (UUID), deleted_at (TIMESTAMP), reason (TEXT)
   - Implement 3-year subscriber data retention policy
   - Create weekly/monthly cleanup jobs
   - Implement GDPR data export before deletion
   - Add draft content cleanup (90 days)

3. **RSS Feed Endpoints** (Priority: Medium)
   - `POST /api/rss/approve` - Approve/reject RSS feeds
   - `GET /api/rss/feeds` - List RSS feeds with approval status

4. **Definition of Done**
   - [ ] RSS approvals table created and migrated
   - [ ] 3-year retention policy implemented
   - [ ] Cleanup jobs scheduled and functional
   - [ ] RSS feed approval endpoints working
   - [ ] GDPR compliance documented

### Estimated Effort (Phase 4 Alternative)
- **Tables + Migration**: 2-3 days
- **Retention + Cleanup**: 3-4 days
- **Endpoints**: 2-3 days
- **Total**: ~1.5 weeks (starts after #3)

**Recommendation**: Given the existing `.github/issues/` files already cover RSS approval and cleanup concepts (issues 04-06), **Option A (keeping Issue #4 as Analytics, Issue #6 as RSS Validation)** may create less duplication. However, the team should explicitly decide and update either the implementation plans OR the GitHub roadmap for consistency.

**Current Decision**: Documented as Issue #4 = Analytics scope, with clear note of the alignment mismatch. Team to decide before proceeding.

---

## Issue #5: Coolify Deployment: Docker and Configuration
**Status**: Depends on Issue #4 completion
**Labels**: `task`, `deployment`

### ⚠️ Phase Alignment Note
**This issue is NOT a development phase in the GitHub roadmap.** 

The GitHub roadmap focuses on **feature development** (Foundation → Core Features → Newsletter → Advanced → RSS → Roadmap). Deployment infrastructure (Docker, Coolify, CI/CD) is an **operational concern** that should be tracked separately.

**Two options**:

**Option A: Keep Issue #5 as-is (for teams that need deployment tracking)**
- Track deployment as a project milestone rather than a development phase
- Useful if Coolify deployment is a blocking requirement for other work
- Estimated effort ~1.5 weeks as documented

**Option B: Remove from 7-issue critical path, add as separate milestone**
- Document deployment as a post-feature milestone
- Add to roadmap as "Phase 6: Deployment" after Phase 5 (RSS)
- Does not block the feature development critical path

**Current Decision**: Documented as Issue #5 with clear alignment note. Team to decide whether to include in critical path or treat as separate operational milestone.

### Parallelizable Work (with Issue #4)
- Can start **Dockerfile design** while #4 tables are being created
- Can parallelize **environment variable configuration** with health check work

### Implementation Plan
_If proceeding with deployment scope:_

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

**Roadmap Alignment**: ⚠️ Not in GitHub roadmap. See alignment note above.

---

## Issue #6: RSS Approval Cleanup: Validation and Quality
**Status**: Depends on Issue #5 completion
**Labels**: `task`, `rss`

### ⚠️ Phase Alignment Note
**This issue has partial overlap with GitHub Phase 4, but with a narrower scope.**

- **GitHub Phase 4**: "RSS Approval Workflow and Data Retention Cleanup" (comprehensive: approval workflow + 3-year retention policy + cleanup_log table + weekly cleanup jobs + GDPR data export + draft content cleanup 90 days)
- **Issue #6 as written**: "RSS Approval Cleanup: Validation and Quality" (narrower: RSS approval table + RSS feed endpoints + validation & detection only)

**Two options**:

**Option A: Keep Issue #6 as-is (Validation & Quality focus)**
- Smaller, more focused scope on RSS feed validation and quality
- Does NOT include the full retention/cleanup infrastructure from GitHub Phase 4
- Estimated effort ~1 week as documented

**Option B: Expand to match GitHub Phase 4 scope**
- Include all elements from GitHub Phase 4: approval workflow, retention policy, cleanup jobs, GDPR compliance
- Would overlap with some of Issue #4's territory if Issue #4 is also Analytics
- Estimated effort ~2 weeks (combined scope)

**Current Decision**: Documented as Issue #6 = Validation & Quality scope (Option A), with clear note of the alignment mismatch. Team to decide before proceeding whether to expand to match GitHub Phase 4.

### Parallelizable Work (with Issue #5)
- Can start **RSS feed validation design** while #5 Docker work proceeds
- Can parallelize **approval table creation** with environment config

### Implementation Plan (Issue #6 as Written - Validation & Quality)
_If proceeding with Validation & Quality scope:_

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

### Alternative: GitHub Phase 4 Full Scope (RSS Approval + Data Retention)
_If aligning with GitHub Phase 4 instead:_

1. **RSS Approvals Table** (Priority: High)
   - Create `rss_approvals` table: id (UUID), feed_url (TEXT, unique), status ('pending'|'approved'|'rejected'), checked_at (TIMESTAMP), notes (TEXT)

2. **Data Retention & Cleanup** (Priority: High)
   - Implement 3-year subscriber data retention policy
   - Create `cleanup_log` table for audit trail
   - Set up weekly/monthly cleanup jobs
   - Implement GDPR data export before deletion
   - Add draft content cleanup (90 days)

3. **RSS Feed Endpoints** (Priority: Medium)
   - `POST /api/rss/approve` - Approve/reject RSS feeds
   - `GET /api/rss/feeds` - List RSS feeds with approval status

4. **Definition of Done**
   - [ ] RSS approvals table created and migrated
   - [ ] 3-year retention policy implemented
   - [ ] Cleanup jobs scheduled and functional
   - [ ] GDPR compliance documented
   - [ ] RSS feed approval endpoints working

### Estimated Effort (Phase 4 Alternative)
- **Tables + Migration + Jobs**: 3-4 days
- **Retention Policy + GDPR**: 2-3 days
- **Endpoints**: 2-3 days
- **Total**: ~2 weeks (expanded scope)

**Recommendation**: Given the existing `.github/issues/04-rss-approval-cleanup.md` file already covers RSS approval and cleanup concepts, **Option A (keeping Issue #6 narrow)** may reduce duplication. However, the team should explicitly decide.

**Current Decision**: Documented as Issue #6 = Validation & Quality scope, with clear note of the alignment mismatch. Team to decide before proceeding whether to expand.

---

## Issue #7: Implementation Roadmap: Project Planning and Milestones
**Status**: Depends on all previous issues completion
**Labels**: `task`, `roadmap`

### Parallelizable Work
- Can start **roadmap documentation** updating while earlier phases are finalized
- Can parallelize **milestone tracking** setup with final phase work

### Implementation Plan
1. **Roadmap Documentation** (Priority: Medium - depends on all phases)
   - **Update `.github/issues/07-IMPLEMENTATION_ROADMAP.md`** - This file does NOT currently exist (only issues 01-06 exist in the repository)
   - Create visual roadmap representation showing all 7 implementation phases (or 5 GitHub phases, depending on team decision)
   - Document phase dependencies and current status

2. **Milestone Tracking** (Priority: Medium - depends on all phases)
   - Implement progress tracking against roadmap milestones
   - Set up regular roadmap review cadence (e.g., bi-weekly review meetings)
   - Track completion percentage per phase

3. **Issue Linking** (Priority: Low - depends on all phases)
   - Link roadmap items to corresponding GitHub issues
   - Create milestone numbers for each phase (if using milestone feature)
   - Document which implementation plans map to which GitHub phases

4. **Definition of Done**
   - [ ] Roadmap documentation updated and maintained
   - [ ] Milestones tracked for all phases
   - [ ] Progress visible and reviewable
   - [ ] Roadmap items linked to GitHub issues

### Estimated Effort
- **Documentation Setup**: 1-2 days (can start early, update continuously)
  - Create `.github/issues/07-IMPLEMENTATION_ROADMAP.md` file
  - Add roadmap summary to project wiki
- **Milestone Tracking**: 2-3 days (after major phases)
- **Linking + Review**: 1 day
- **Total**: ~1 week (starts after #6, but documentation can be ongoing)

### ⚠️ Phase Alignment Note
**This issue is meta-work (documentation/update tracking) and has no corresponding development phase in the GitHub roadmap.**

**Two options**:

**Option A: Include as final phase in 7-issue plan**
- Add `.github/issues/07-IMPLEMENTATION_ROADMAP.md` as Issue #7
- Document that this is ongoing maintenance, not a development feature
- Mark as complete once roadmap is established and linked

**Option B: Remove from 7-issue critical path, treat as project governance**
- Document roadmap maintenance as a separate governance activity
- Not part of the development critical path
- Reviewed periodically, not on a fixed issue cycle

**Current Decision**: Documented as Issue #7 with clear note about the non-existent roadmap file. Team to create `.github/issues/07-IMPLEMENTATION_ROADMAP.md` or adjust the reference before starting work.

**Recommended next step**: Create the roadmap documentation file with:
- Overview of all 7 implementation phases (or 5 GitHub phases)
- Current status of each phase (not started, in progress, complete)
- Dependencies between phases
- Link to corresponding GitHub issues
- Review cadence and responsible parties

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
---

## Roadmap Alignment Summary & Team Decisions Needed

The following summary captures the key alignment findings from the reviewer analysis. The team should discuss and document decisions before proceeding.

### 🏗️ Critical Decision: Phase Structure

**Choose ONE of the following two approaches:**

| Approach | Description | Impact on Issues |
|----------|-------------|------------------|
| **A: Keep 7-Issue Plan** | Maintain the 7-issue critical path as documented. Align GitHub roadmap to match. | All 7 issues proceed as written. Requires updating `IMPLEMENTATION_ROADMAP.md` to include Phases: Foundation, Core Features, Newsletter, Analytics, Deployment, RSS Quality, Roadmap Documentation. |
| **B: Align to 5-GitHub Phases** | Restructure implementation plans to match existing 5-phase GitHub roadmap. | Issues merged/removed: <br>• Issue #4 Analytics merged with or replaced by GitHub Phase 4 (RSS Approval + Data Retention)<br>• Issue #5 Deployment removed from critical path or treated as separate milestone<br>• Issue #6 RSS Validation narrowed or expanded to match Phase 4<br>• Issue #7 Roadmap documentation kept as governance activity |

### 📋 Recommended Path: Approach A (with Explicit Mapping)

Given that:
- The existing `.github/issues/04-rss-approval-cleanup.md` and `.github/issues/06-coolify-deployment.md` files already provide conceptual groundwork
- The 7-issue plan provides more granular parallel workstreams
- The team can always restructure later

**Recommended**: Proceed with **Approach A** but add an explicit mapping table at the top of `docs/07-implementation-plans.md` (already included in the updated document). Update the GitHub roadmap (`IMPLEMENTATION_ROADMAP.md`) to include the new phases.

### ⚠️ Issues Requiring Team Decision

| # | Issue | Conflict | Decision Needed | Time to Decide |
|---|-------|----------|----------------|----------------|
| 1 | Issue #4 Scope | "Analytics and Monitoring" vs GitHub Phase 4 "RSS Approval + Data Retention" | Re-scope Issue #4 OR update GitHub roadmap to include Analytics phase | **Before starting #3** |
| 2 | Issue #5 Inclusion | "Coolify Deployment" not in GitHub roadmap | Include in critical path OR treat as separate operational milestone | **Before starting #4** |
| 3 | Issue #6 Scope | "Validation and Quality" vs GitHub Phase 4 full scope | Keep narrow scope OR expand to match Phase 4 (includes retention, cleanup jobs, GDPR) | **Before starting #5** |
| 4 | Issue #7 Roadmap File | `.github/issues/07-IMPLEMENTATION_ROADMAP.md` does not exist | Create the file OR remove Issue #7 from critical path | **Before starting #6** |

### ✅ Issues Ready to Proceed (No Conflicts)

| # | Issue | Status | Dependencies |
|---|-------|--------|--------------|
| 1 | Foundation: Database Tables and API Keys | ✅ Ready | None - start immediately |
| 2 | Core Features: RSS Subscribers Management | ✅ Ready | #1 complete |
| 3 | Newsletter Engine: Core Functionality | ✅ Ready | #2 complete |

### 📝 Recommended Next Steps

1. **Team discussion** (30-60 min) to decide on Approach A vs B above
2. **If Approach A**: Update `IMPLEMENTATION_ROADMAP.md` to include 7 phases
3. **If Approach B**: Restructure the implementation plans to match 5-phase roadmap
4. **Create `.github/issues/07-IMPLEMENTATION_ROADMAP.md`** if using Approach A
5. **Start Issue #1** (Foundation - no dependencies, can begin immediately)

### 🔄 Parallel Workstream Recommendations

Based on the chosen approach, here are the recommended parallel workstreams:

| Workstream | If Approach A (7 issues) | If Approach B (5 phases) |
|------------|-------------------------|--------------------------|
| **Wkstream A**: Foundation | Issue #1 full focus | Issue #1 full focus (maps to Phase 1) |
| **Wkstream B**: Preparation | Design issues #2-#7 in parallel | Design issues #2-#5 in parallel (aligned to phases) |
| **Wkstream C**: Documentation | Continuously update `docs/07-implementation-plans.md` | Update roadmap docs to match 5-phase structure |
| **Wkstream D**: Review | Reviewer checkpoints after each of #1-#7 | Reviewer checkpoints after each of Phase 1-5 |

### 📞 Decision Timeline

| When | Action |
|------|--------|
| **This week** | Team discussion to choose Approach A or B |
| **If Approach A this week** | Create `IMPLEMENTATION_ROADMAP.md` updates, create `.github/issues/07-IMPLEMENTATION_ROADMAP.md` |
| **If Approach B this week** | Restructure implementation plans, update issue scopes |
| **After decision** | Begin Issue #1 (Foundation) - can start immediately regardless |
| **After #1 complete** | Proceed to #2, then review decision impact |
