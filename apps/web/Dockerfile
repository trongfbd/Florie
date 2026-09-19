# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
# Cache mount so a flaky/slow registry connection doesn't force re-downloading
# already-fetched packages on every retry — persists pnpm's store across
# separate `docker build` invocations (unlike a regular layer, which a failed
# RUN never commits). The retry loop re-invokes pnpm itself (each invocation
# gets a fresh internal retry/timeout budget) for the same reason — under a
# sustained slow connection, a handful of the largest tarballs can outlast
# even pnpm's own retries in one invocation, but succeed within a few.
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    sh -c 'i=0; until pnpm install --frozen-lockfile; do i=$((i+1)); [ $i -ge 8 ] && exit 1; echo "install attempt $i failed, retrying..."; sleep 5; done'

FROM deps AS build
COPY apps/web apps/web
# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so
# they must be passed as build args, not just runtime env vars — a value
# only set at `docker run` time would never reach the browser bundle.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_SITE_URL
ARG MEDIA_PUBLIC_HOSTNAME
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV MEDIA_PUBLIC_HOSTNAME=$MEDIA_PUBLIC_HOSTNAME
ENV NODE_ENV=production
RUN pnpm --filter web build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app
# `output: "standalone"` (next.config.ts) traces only the node_modules this
# app actually needs into .next/standalone — but it deliberately excludes
# public/ and .next/static/, which must be copied in separately. In a pnpm
# monorepo the standalone tree mirrors the workspace root, so the real
# entrypoint ends up at apps/web/server.js, not ./server.js.
COPY --from=build /repo/apps/web/public ./apps/web/public
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
