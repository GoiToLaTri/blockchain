# # 1. Base image
# FROM node:20-alpine AS base

# # 2. Install dependencies
# FROM base AS deps
# WORKDIR /app
# COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# RUN \
#   if [ -f package-lock.json ]; then npm ci; \
#   elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
#   elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
#   else echo "No lockfile found." && exit 1; \
#   fi

# # 3. Build app
# FROM base AS builder
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .

# RUN npm run build

# # 4. Production image
# FROM base AS runner
# WORKDIR /app

# ENV NODE_ENV=production

# # Chỉ copy những gì cần thiết
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/static ./.next/static

# CMD ["node", "server.js"]


# ===================================
# Stage 1: Builder
# ===================================
FROM node:22-bookworm-slim AS builder
# FROM oven/bun:latest AS builder

WORKDIR /app 

COPY package.json package-lock.json ./
# COPY package.json bun.lock ./

# Cài dependencies (dotenv sẽ nằm trong node_modules ở stage này)
RUN --mount=type=cache,id=npm_nextjs_cache,target=/root/.npm npm ci
# RUN --mount=type=cache,id=bun_nextjs_cache,target=/root/.bun/install/cache \
#     bun install --frozen-lockfile


COPY . .
# COPY .env.production .env.production

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PRIVATE_STANDALONE=true

RUN npm run build
# RUN bun run bun:build

# ===================================
# Stage 2: Production Runner
# ===================================
FROM node:22-bookworm-slim AS production

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

WORKDIR /app

RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -s /bin/bash -m nextjs && \
    mkdir .next && \
    chown -R nextjs:nodejs /app

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# COPY --from=builder --chown=nextjs:nodejs /app/.env.production ./

USER nextjs

# EXPOSE 3000

HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000').then(r => {if(r.status !== 200) process.exit(1)}).catch(() => process.exit(1))"

CMD ["node", "--env-file=.env", "server.js"]