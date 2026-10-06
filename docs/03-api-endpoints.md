# IE237 API - Endpoints Reference

## Base URL
`/api` prefixed handlers (Nitro routes)

## Content Endpoints

### GET /api/news
- **Query params**: `limit` (default 10), `offset`, `type`, `status`
- **Response**: Array of published news items
- **Purpose**: List latest news

### GET /api/blogs
- **Query params**: `limit` (default 10), `offset`, `type`, `status`
- **Response**: Array of published blog posts
- **Purpose**: List latest blogs

### GET /api/content/:slug
- **Params**: `slug`
- **Response**: Single content item by slug
- **Purpose**: View individual article

## RSS Endpoints

### GET /api/rss
- **Response**: RSS XML feed
- **Purpose**: Default RSS feed (configured categories)

### GET /api/rss/:feedName
- **Params**: `feedName`
- **Response**: RSS XML for specific feed
- **Purpose**: Specific category/topic feed

**Note**: RSS requires user approval before publication (curated mode)

## Newsletter Endpoints

### POST /api/newsletter/subscribe
- **Body**: `{ email, preferences?: ["topic1", "topic2"] }`
- **Response**: `{ success, subscriptionId }`
- **Purpose**: Subscribe to weekly newsletter

### POST /api/newsletter/unsubscribe
- **Body**: `{ email }`
- **Response**: `{ success }`
- **Purpose**: Unsubscribe from newsletter

### GET /api/newsletter/status
- **Response**: `{ active, lastSent, nextScheduled }`
- **Purpose**: Check newsletter status

## Authentication Endpoints

### POST /api/auth/api-key
- **Body**: `{ apiKey }`
- **Response**: `{ authorized, permissions }`
- **Purpose**: API key authentication

### GET /api/auth/me
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User profile and permissions
- **Purpose**: authenticated user info

## Health & Utility

### GET /api/health
- **Response**: `{ status, timestamp, version }`
- **Purpose**: Health check for deployments

### GET /api/docs
- **Response**: List of available documentation files in `docs/`
- **Purpose**: Developer/agent documentation listing