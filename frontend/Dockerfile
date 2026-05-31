# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps

FROM deps AS builder
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_DEFAULT_THEME
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_DEFAULT_THEME=${NEXT_PUBLIC_DEFAULT_THEME}
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_DEFAULT_THEME
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_DEFAULT_THEME=${NEXT_PUBLIC_DEFAULT_THEME}
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package.json ./
EXPOSE 3000
CMD ["npm", "run", "start"]
