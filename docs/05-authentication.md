# IE237 API - Authentication Design

## Primary Auth: API Keys

### API Key Model
- **Format**: Random UUID string (e.g., `ik_2f3a1b4c5d6e7g8h9i0j`)
- **Storage**: Hashed in database (bcrypt/argon2)
- **Permissions**: Scoped per key (read, write, admin)
- **Primary mechanism**: Machine-to-machine authentication

### API Key Endpoints
- `POST /api/auth/api-key` - Authenticate with key
- Returns: `{ authorized, permissions, keyId }`

### Key Permission Scopes
- `content:read` - Read news/blogs content
- `content:write` - Create/update content
- `rss:manage` - Configure and publish RSS feeds
- `newsletter:manage` - Subscribe/unsubscribe, manage list
- `admin:full` - Full administrative access

## Secondary Auth: User Accounts (Optional)

### User Model
- Email + password (hashed)
- Role: `user`, `admin`
- Associated API keys
- Login tracking

### User Authentication
- `POST /api/auth/login` - Email/password
- `POST /api/auth/register` - New account
- `POST /api/auth/logout`
- `GET /api/auth/me` - Current user profile

### When to Use User Auth
- Admin UI operations
- Content moderation
- Subscriber management
- Not required for public content consumption

## Tertiary Auth: OAuth (Optional)

### Providers
- Google, GitHub, etc. (if needed later)
- Used for admin console access
- Not required for API primary function

### OAuth Implementation
- Standard OAuth 2.0 flow
- Token storage and refresh
- User profile import

## Auth Middleware (h3)

```typescript
// Example h3 middleware
defineEventHandler(async (event) => {
  const auth = getHeader(event, 'authorization')
  const key = auth?.replace('Bearer ', '')
  
  if (!key) {
    setResponseStatus(event, 401)
    return createError({ statusMessage: 'API key required' })
  }
  
  const user = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.key, key)
  })
  
  if (!user) {
    setResponseStatus(event, 401)
    return createError({ statusMessage: 'Invalid API key' })
  }
  
  // Attach user to event
  event.context.user = user
})
```

## Security Recommendations
1. **API keys** as primary mechanism
2. **Rate limiting** per API key
3. **HTTPS only** for all endpoints
4. **Key rotation** policy (every 90 days)
5. **IP allowlisting** for sensitive operations
6. **Audit logging** of all API key usage