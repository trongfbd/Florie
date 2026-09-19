# syntax=docker/dockerfile:1
#
# Single pnpm install (with devDependencies) reused across build + runtime,
# rather than fighting pnpm's symlinked node_modules layout to hand-copy a
# slimmed-down production-only node_modules across stages — correctness and
# simplicity over image-size optimization, matching this project's existing
# "stay lightweight, don't over-engineer" bias (see florie-roadmap memory).

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
# Cache mount so a flaky/slow registry connection doesn't force re-downloading
# already-fetched packages on every retry — persists pnpm's store across
# separate `docker build` invocations (unlike a regular layer, which a failed
# RUN never commits). The retry loop re-invokes pnpm itself (each invocation
# gets a fresh internal retry/timeout budget) for the same reason — under a
# sustained slow connection, a handful of the largest tarballs can outlast
# even pnpm's own retries in one invocation, but succeed within a few.
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    sh -c 'i=0; until pnpm install --frozen-lockfile; do i=$((i+1)); [ $i -ge 8 ] && exit 1; echo "install attempt $i failed, retrying..."; sleep 5; done'

FROM base AS build
COPY apps/api apps/api
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build

FROM node:22-alpine AS runtime
# postgresql16-client matches docker-compose.yml's postgres:16-alpine — keep
# these in sync. A mismatched pg_dump/psql client version can emit or expect
# SQL the server doesn't understand (see BackupsService.sanitizeForRestore
# for a real example of this exact class of bug, kept as a defensive
# backstop even when the versions are pinned to match here).
RUN apk add --no-cache postgresql16-client
RUN corepack enable
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api ./apps/api

WORKDIR /repo/apps/api
EXPOSE 4000
CMD ["node", "dist/src/main"]
