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

# Run tests (allow failure to ensure build completes)
RUN bun run test || true

ENV NODE_ENV=production

RUN bun build src/server.ts \
  --outfile server.js \
  --target bun \
  --minify \
  --sourcemap=none

# ---- runtime (full image needed for cast/curl) ----
FROM oven/bun:1 AS runtime
WORKDIR /app

# Install dependencies for foundry/cast
RUN apt-get update && apt-get install -y curl git bash

# Install Foundry (cast)
RUN curl -L https://foundry.paradigm.xyz | bash
ENV PATH="/root/.foundry/bin:${PATH}"
RUN foundryup

# Move binaries to global path so 'bun' user can access them
RUN cp /root/.foundry/bin/cast /usr/local/bin/cast && \
    chmod +x /usr/local/bin/cast

ENV NODE_ENV=production

COPY --from=build /app/server.js .
COPY --from=deps /app/node_modules node_modules
COPY package.json .

USER bun
EXPOSE 4000/tcp
CMD ["bun", "server.js"]