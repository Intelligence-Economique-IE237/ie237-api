# IE237 API

API for an information system with RSS, newsletters, news, and blogs.

## 📬 Core Features

- **News**: Published news items with categorization and tagging
- **Blogs**: Long-form content posts with topic preferences
- **RSS Feeds**: Auto-generated with manual channel configuration and user approval
- **Newsletters**: Weekly scheduled email digests to subscribers with topic filtering

## 🚀 Getting Started

```bash
npm install
npm run dev
```

## 📦 Deploying

```bash
pnpm run build
```

Then checkout the [Nitro documentation](https://nitro.build/deploy) to learn more about the different deployment presets.

## 🏗️ Project Structure

- **Documentation**: Markdown files in `docs/` directory (no API endpoints for docs)
  - `01-overview.md` - Project mission and features
  - `02-data-models.md` - Database schema and models
  - `03-api-endpoints.md` - RESTful API reference
  - `04-rss-configuration.md` - RSS feed setup and generation
  - `05-authentication.md` - API key and auth design
  - `06-cleanup-policy.md` - Data retention and compliance

- **Every feature** should be done on a branch prefixed with `f/` to indicate it's a feature
- **Every bug fix** should be done on a branch prefixed with `b/` to indicate it's a bug-fix

## 💾 Technology Stack

- **Framework**: Nitro v3 (Vue/Nitro build)
- **Server**: h3 HTTP framework
- **Build**: Rolldown
- **ORM**: Drizzle ORM with PostgreSQL migrations
- **Language**: TypeScript
- **Database**: PostgreSQL

## 🏷️ Branch Naming Conventions

| Branch Type | Prefix | Example |
|-------------|--------|---------|
| Feature | `f/` | `f/add-rss-endpoint` |
| Bug Fix | `b/` | `b/fix-null-reference` |

## 📐 System Design Summary

| Area | Decision |
|------|----------|
| Content Model | Unified table with type discriminator (`news`/`blog`) |
| Newsletter Schedule | Weekly, consistent notifications |
| Subscriber Topics | politics, technology, sports, business, etc. |
| Email Service | SendGrid hybrid (delivery + custom tracking) |
| Data Retention | 3 years subscriber data, automated cleanup |
| RSS Architecture | Auto-generated + manual approval, user approval before publish |
| Authentication | API keys primary, optional user/OAuth |
| Documentation | Markdown in `docs/`, NO API endpoints |

## 📖 Documentation

All documentation is in the `docs/` directory as Markdown files for:
- Developer onboarding
- Agent knowledge base
- System design descriptions
- Feature drafts and decisions

**No API endpoints** are provided for documentation access - it's purely reference material.

## 🔧 Development Workflow

1. Create feature branch: `git checkout -b f/feature-name`
2. Create bug fix branch: `git checkout -b b/bug-name`
3. Implement changes
4. Commit and push
5. Open PR

## 🗄️ Key Design Decisions

- **Data**: Content stored in unified table with `type` discriminator (`news` | `blog`)
- **Newsletter**: Weekly scheduled digests, ~500-1000 posts/week
- **RSS**: Curated mode - user approval required before publication
- **Auth**: API keys as primary mechanism with scoped permissions
- **Retention**: 3-year subscriber data lifecycle with automated cleanup jobs
- **Segmentation**: Topic-based preferences for newsletter filtering
- **Compliance**: GDPR/CAN-SPAM compliant with export and deletion capabilities