# Production Dockerfile for bothost deployment
FROM node:20-alpine AS builder

WORKDIR /app

ENV USE_DATABASE=false
ENV NEXT_DISABLE_TURBOPACK=true

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN test -f .next/BUILD_ID && echo "BUILD_ID found: $(cat .next/BUILD_ID)" || (echo "Error: production build not found in .next directory" && exit 1)

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV NEXT_DISABLE_TURBOPACK=true

COPY --from=builder /app ./

EXPOSE 8080

CMD ["npx", "next", "start", "-p", "8080"]
