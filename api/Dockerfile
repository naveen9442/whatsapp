# Stage 1: production deps + dev deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Production deps
RUN npm install --omit=dev && cp -r node_modules /tmp/prod_modules
# Dev deps for build
RUN npm install

# Stage 2: build TypeScript
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: lean production image
FROM node:20-alpine AS production
WORKDIR /app

# Install curl for healthcheck and openssl for Prisma runtime engine
RUN apk add --no-cache curl openssl

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Runtime dependencies
COPY --from=deps /tmp/prod_modules ./node_modules
# Prisma client (generated)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# Compiled app
COPY --from=builder /app/dist ./dist
# Prisma schema (for migrate deploy)
COPY prisma ./prisma
COPY package.json .
# Entrypoint (auto-runs migrations)
COPY entrypoint.sh ./entrypoint.sh

RUN chmod +x entrypoint.sh && chown -R appuser:appgroup /app

USER appuser
EXPOSE 4000

ENTRYPOINT ["./entrypoint.sh"]
