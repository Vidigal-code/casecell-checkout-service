# syntax=docker/dockerfile:1.6

FROM node:20-bullseye AS base
WORKDIR /app

FROM base AS deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ openssl libssl1.1 curl \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install --legacy-peer-deps

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && test -f dist/main.js

FROM base AS runner
ENV NODE_ENV=production
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl libssl1.1 curl \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD [ "node", "dist/main.js" ]
