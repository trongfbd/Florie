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
RUN pnpm install --frozen-lockfile

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
