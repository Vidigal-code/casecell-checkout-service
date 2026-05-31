# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
RUN apk add --no-cache python3 make g++
COPY package.json ./
RUN npm install --legacy-peer-deps

FROM deps AS builder
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY package.json ./
EXPOSE 3001
CMD [ "node", "dist/main.js" ]
