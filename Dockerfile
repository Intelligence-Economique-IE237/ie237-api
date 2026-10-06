# IE237 API - Nitro Dockerfile
# -----------------------------------------
# Containerized Nitro API application
# -----------------------------------------

# 1️⃣ Base Image
FROM node:20-alpine AS base

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Install dependencies only when needed
#    (leverages Docker cache step 4/5)
FROM base AS dependencies
  # Update and install libc6-compatible deps for Alpine
  # plus common build tools
  RUN apk add --no-cache \
    bash \
    git \
    curl \
    && corepack enable

# Copy package manifests
COPY package.json pnpm-lock.yaml* ./

# Install dependencies with pnpm
# --frozen-lockfile ensures consistent installs
# --offline prevents network issues during build
RUN pnpm install --frozen-lockfile --offline

# 4️⃣ Copy application code
FROM dependencies AS builder
  COPY . .

# 5️⃣ Build the Nitro application
#    - nitro build generates the server bundle
RUN pnpm build

# 6️⃣ Production runtime
FROM base AS runner
  WORKDIR /app

  # Copy built assets from builder
  COPY --from=builder /app/.output ./.output
  COPY --from=builder /app/package.json ./

  # Set NODE_ENV to production
  ENV NODE_ENV=production

  # Expose the port Nitro runs on (default 3000)
  # Nitro typically uses port 3000 or the port from nitro.config
  EXPOSE 3000

  # Start the Nitro server
  # Using `nitro run` for development-ready production
  # Or `nitro preview` for static-ready production
  CMD ["pnpm", "start"]

  # Alternative: direct node execution if needed
  # ENTRYPOINT ["node", ".output/server/index.mjs"]