# syntax=docker/dockerfile:1.7

FROM oven/bun:1 AS base
WORKDIR /app

# ---- deps (maksimum cache) ----
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---- build (Next.js production build) ----
FROM base AS build
ARG BACKEND_URL=http://backend:4000
ENV BACKEND_URL=${BACKEND_URL}
ENV NODE_ENV=production

COPY --from=deps /app/node_modules node_modules
COPY . .

RUN bun run build

# ---- runtime (küçük image) ----
FROM oven/bun:1-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static .next/static
COPY --from=build /app/public public

USER bun
EXPOSE 3000/tcp
CMD ["bun", "server.js"]