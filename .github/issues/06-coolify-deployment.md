# Feature: Coolify Deployment Configuration

## Description
Configure the IE237 API for deployment on Coolify Docker platform. This issue covers the Docker configuration, environment variables, and deployment setup required to run the API on Coolify.

## Acceptance Criteria
- [ ] Dockerfile created and tested locally
- [ ] .dockerignore created to exclude unnecessary files
- [ ] docker-compose.yml created for full stack (API + PostgreSQL)
- [ ] Environment variables documented and configured for Coolify
- [ ] Health check endpoint `/health` functional
- [ ] Application deploys successfully to Coolify
- [ ] Database connects successfully on Coolify
- [ ] Custom domain can be added (optional)
- [ ] SSL certificate can be auto-generated via Coolify

## Technical Details

### Dockerfile
- **Location**: `./Dockerfile`
- **Base Image**: `node:20-alpine`
- **Build**: `pnpm install && pnpm build`
- **Start**: `pnpm start`
- **Port**: `3000` (internal), mapped to host port
- **Multi-stage build**: dependencies → builder → runner

### docker-compose.yml
- **Location**: `./docker-compose.yml`
- **Services**: 
  - `api` (Nitro container)
  - `db` (PostgreSQL 16-alpine)
- **Volumes**: `pg_data` for persistent storage
- **Health checks**: Both services have healthcheck configurations

### Environment Variables (Required for Coolify)
| Variable | Example Value | Description |
|----------|--------------|-------------|
| `DB_USER` | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | `secure_password` | PostgreSQL password |
| `DB_NAME` | `ie237` | Database name |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3000` | Application port |
| `API_KEY_SECRET` | `generate_secure_key_24_chars_min` | API key hashing secret |
| `BASE_URL` | `https://api.ie237.com` | Custom domain base URL |
| `SENDGRID_API_KEY` | `SG.xxxxxx` | Email service (Phase 3) |

### Coolify Configuration
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`
- **Internal Port**: `3000`
- **External Port**: `3000` (or 80/443 with reverse proxy)
- **Health Check URL**: `http://localhost:3000/health`
- **Restart Policy**: `unless-stopped`

### Post-Deployment Checklist
- [ ] App status shows "Running" in Coolify dashboard
- [ ] `https://your-domain.com/health` returns `{"message":"Hello from API!"}`
- [ ] API key authentication works via `POST /api/auth/api-key`
- [ ] Database migrations applied (Drizzle auto-runs on startup)
- [ ] SSL certificate issued (if custom domain added)
- [ ] Logs show no critical errors at startup

### Coolify-Specific Notes
- Coolify auto-detects Dockerfile from repository root
- Environment variables set in Coolify dashboard → Settings → Environment Variables
- Use "Secret Variables" for sensitive data (DB_PASSWORD, SENDGRID_API_KEY)
- PostgreSQL service can be added automatically or manually
- DNS records must point to Coolify domain for custom domains
- Auto SSL (Let's Encrypt) available for HTTPS

## Dependencies
- [ ] Phase 1: Foundation - Database tables and API keys (issues 01)
- [ ] Phase 2: Core Features - RSS and subscribers (issues 02)
- [ ] All API endpoints implemented and tested locally before deployment

## Definition of Done
- IE237 API runs successfully on Coolify platform
- All core endpoints functional via browser/HTTP client
- Database persistence working (data survives container restart)
- Environment variables configured and not causing startup errors
- Coolify dashboard shows healthy application status

## Notes
- Test locally with `docker build .` and `docker run` before deploying to Coolify
- Ensure `.dockerignore` excludes `node_modules`, `.output`, env files
- Coolify may auto-provision PostgreSQL if selected during app creation
- Keep `docker-compose.yml` as reference for local development with Docker Compose
- Monitor Coolify resource usage after deployment (CPU, memory, logs)