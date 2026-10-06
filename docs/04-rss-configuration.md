# IE237 API - RSS Feed Configuration

## RSS Architecture
- **Mode**: Auto-generated from latest content + manual channel configuration
- **Approval**: User approval required before publication (curated mode)
- **Multiple feeds**: Possible per category or author

## Configuration Structure (config_json)

```json
{
  "feedName": "IE237 Weekly Digest",
  "description": "Weekly roundup of top news and blogs",
  "categories": ["technology", "sports", "business"],
  "includeTypes": ["news", "blog"],
  "itemLimit": 10,
  "publishDate": "2024-01-15T09:00:00Z",
  "approvalRequired": true,
  "authorWhitelist": ["admin-user"]
}
```

## RSS Generation Process

1. **Cron job** runs weekly (e.g., Sunday 09:00 UTC)
2. **Query** content table for published items since last build
3. **Filter** by configured categories and types
4. **Sort** by created_at descending
5. **Limit** to itemLimit (default 10)
6. **Generate** XML RSS feed
7. **Pause** for user approval
8. **Publish** approved feed
9. **Update** rss_feeds.last_built_at

## RSS XML Structure

Standard RSS 2.0 format with:
- `<channel>`: metadata (title, description, link)
- `<item>` per piece of content:
  - `<title>`
  - `<description>` or `<content:encoded>`
  - `<link>` (permalink)
  - `<pubDate>` (RFC 822 format)
  - Optional `<category>`

## Manual Override
- Admins can manually add/remove items from feed
- Configuration updates via API or direct DB edit
- Feed can be paused/resumed via admin panel