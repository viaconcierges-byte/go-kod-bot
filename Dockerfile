# Production Dockerfile for bothost deployment
# Base image compatible with bothost: Node 20

FROM node:20-alpine AS builder

WORKDIR /app

# Build-time env: disable DynamoDB so `next build` does not fail without a DB
ENV USE_DATABASE=false

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

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the entire built project (including .next, node_modules, lib, scripts,
# next.config.ts) so `next start` can find the production build.
COPY --from=builder --chown=nextjs:nodejs /app ./

USER nextjs

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["npx", "next", "start", "-p", "8080"]