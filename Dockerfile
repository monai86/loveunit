# ============================================================================
# MUMT Blood Donation 2026 — production image
# Multi-stage build using Next.js standalone output (output: "standalone").
# Build:  docker build -t loveunit .
# Run:    docker run -p 3000:3000 --env-file .env.local loveunit
# ============================================================================

# ---- 1. Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- 2. Builder ----
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The app renders pages dynamically and does NOT require DATABASE_URL at build time.
RUN npm run build

# ---- 3. Runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
# Runtime secrets (DATABASE_URL, BETTER_AUTH_SECRET, SMTP_*) must be provided
# via environment variables or secrets manager at deploy time.
CMD ["node", "server.js"]
