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

# Copy the entire built project (including .next, node_modules, lib, scripts,
# next.config.ts) so `next start` can find the production build.
COPY --from=builder --chown=nextjs:nodejs /app ./

USER nextjs

EXPOSE 8080

CMD ["npx", "next", "start", "-p", "8080"]
