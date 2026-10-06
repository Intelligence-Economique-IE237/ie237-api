# IE237 API - Feature Implementation Roadmap

This directory contains GitHub issue markdown files for each phase of the IE237 API feature roadmap. 

## Phase Mapping

| Phase | Issues | Estimated Focus |
|-------|--------|-----------------|
| **Phase 1** | `01-foundation-database.md` | Database tables, API keys, basic CRUD |
| **Phase 2** | `02-core-features-rss-subscribers.md` | RSS generation, subscriber management |
| **Phase 3** | `03-newsletter-engine.md` | Weekly newsletter generation, email sending |
| **Phase 4** | `04-rss-approval-cleanup.md` | RSS approval workflow, data retention cleanup |
| **Phase 5** | `05-advanced-features.md` | Tagging, search, optional user auth |

## How to Use These Issues

1. **Start with Phase 1** (`01-foundation-database.md`) - no dependencies
2. **Progress sequentially** - each phase builds on previous
3. **Create GitHub issues** from these markdown files via:
   - Repository > Issues > New Issue > From template
   - Or copy content into manual issue creation
4. **Check checkboxes** as acceptance criteria are met
5. **Reference related phases** when working on dependent features

## Implementation Order

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
   ↓          ↓         ↓          ↓         ↓
Foundation Core Features Newsletter RSS+Cleanup Advanced
```

## Each Issue Contains

- **Description**: What to implement
- **Acceptance Criteria**: Checklist of what "done" looks like
- **Technical Details**: Implementation guidance
- **Dependencies**: Which phases must complete first
- **Definition of Done**: Concrete completion criteria
- **Notes**: Additional context and considerations

## GitHub Import Tips

To create actual GitHub issues from these markdown files:

1. Go to your repository on github.com
2. Click "Issues" > "New Issue"
3. Click "Use template" and select a default issue template, OR
4. Start with a blank issue and copy the markdown content
5. Add appropriate labels (e.g., `phase-1`, `phase-2`, etc.)
6. Assign milestone if using GitHub Projects

## Labels Suggestion

- `phase-1`, `phase-2`, `phase-3`, `phase-4`, `phase-5`
- `foundation`, `core`, `newsletter`, `rss`, `cleanup`
- `database`, `api`, `auth`, `email`