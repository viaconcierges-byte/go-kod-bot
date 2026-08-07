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

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app ./

RUN ls -la .next && cat .next/BUILD_ID

EXPOSE 8080

CMD ["npx", "next", "start", "-p", "8080"]
