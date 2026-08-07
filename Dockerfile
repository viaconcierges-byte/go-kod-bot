# Production Dockerfile for bothost deployment
# Base image compatible with bothost: Node 20

FROM node:20-alpine AS builder

WORKDIR /app

# Build-time env: disable DynamoDB so `next build` does not fail without a DB
ENV USE_DATABASE=false
# Disable Turbopack so both build and `next start` use the webpack output
ENV NEXT_DISABLE_TURBOPACK=true

COPY package*.json ./

RUN npm ci

COPY . .

RUN mkdir -p public

RUN npm run build

# Verify the production build artifacts exist before using them
RUN test -f .next/BUILD_ID && echo "BUILD_ID found: $(cat .next/BUILD_ID)" || (echo "Error: production build not found in .next directory" && exit 1)

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
# Disable Turbopack so `next start` runs the webpack production build
ENV NEXT_DISABLE_TURBOPACK=true

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

USER nextjs

EXPOSE 8080

CMD ["npx", "next", "start", "-p", "8080"]
