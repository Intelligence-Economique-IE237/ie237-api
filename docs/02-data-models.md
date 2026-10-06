# IE237 API - Data Models

## Content Table (Unified with Type Discriminator)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | TEXT | Content title |
| `slug` | TEXT | URL-friendly identifier (unique) |
| `type` | TEXT | `'news'` or `'blog'` |
| `status` | TEXT | `'draft'` or `'published'` |
| `content` | TEXT | Full content body |
| `excerpt` | TEXT | Short summary (for listings/feeds) |
| `created_at` | TIMESTAMP | Auto-created |
| `updated_at` | TIMESTAMP | Auto-updated |

## RSS Feeds Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Human-readable feed name |
| `description` | TEXT | Feed description |
| `config_json` | JSON | Feed configuration (categories, items, etc.) |
| `last_built_at` | TIMESTAMP | When RSS was last generated |
| `is_active` | BOOLEAN | Whether feed is actively generated |

## Subscribers Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `email` | TEXT | Email address (unique) |
| `status` | TEXT | `'active'`, `'unsubscribed'`, `'pending'` |
| `preferences_json` | JSON | Topic preferences (e.g., `["technology", "sports"]`) |
| `created_at` | TIMESTAMP | Subscription date |
| `unsubscribed_at` | TIMESTAMP | When unsubscribed |
| `last_newsletter_sent` | TIMESTAMP | Last newsletter delivery |

## Cleanup Policy

### Subscriber Data Retention
- **Retention period**: 3 years from `created_at`
- **Automated cleanup**: Scheduled job runs weekly/monthly
- **GDPR/CAN-SPAM compliance**: Data deleted after retention period
- **Export capability**: Subscriber data export before deletion

### Example Cleanup Query
```sql
DELETE FROM subscribers 
WHERE created_at < NOW() - INTERVAL '3 years'
  AND status = 'unsubscribed';
```

## Indexes & Performance
- `idx_content_slug`: UNIQUE on slug
- `idx_content_type_status`: Index on (type, status)
- `idx_subscribers_email`: UNIQUE on email
- `idx_subscribers_status`: Index on status