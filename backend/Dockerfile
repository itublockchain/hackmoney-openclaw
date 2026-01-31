# syntax=docker/dockerfile:1.7

FROM oven/bun:1 AS base
WORKDIR /app

# ---- deps (maksimum cache) ----
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install

# ---- build (bundle + minify) ----
FROM base AS build
COPY --from=deps /app/node_modules node_modules
COPY . .

ENV NODE_ENV=production

RUN bun build src/server.ts \
  --outfile server.js \
  --target bun \
  --minify \
  --sourcemap=none

# ---- runtime (küçük image) ----
FROM oven/bun:1-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/server.js .
COPY --from=deps /app/node_modules node_modules
COPY package.json .

USER bun
EXPOSE 4000/tcp
CMD ["bun", "server.js"]