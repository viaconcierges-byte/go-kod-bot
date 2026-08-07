# Production Dockerfile for bothost
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ENV NODE_ENV=production
ENV USE_DATABASE=false
ENV OUTPUT_MODE=

RUN npm run build

RUN test -f .next/BUILD_ID && echo "BUILD_ID exists" || (echo "BUILD_ID missing" && exit 1)

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/scripts ./scripts

EXPOSE 8080

CMD ["npx", "next", "start", "-p", "8080"]
