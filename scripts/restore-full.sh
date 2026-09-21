#!/bin/sh
set -eu

# Restore a backup produced by scripts/backup-full.sh onto a FRESH VPS.
#
# Run this from a freshly `git clone`d repo root, AFTER Section 2 of
# DEPLOYMENT.md (Docker installed, repo cloned) but BEFORE Section 3/4
# (there is no .env.production or nginx/florie.conf yet -- this script
# restores both from the backup instead of you filling them in by hand).
# It brings up only postgres+minio (+minio-init, to create the bucket) to
# load data into them; once it's done,
# continue with DEPLOYMENT.md Section 4 (fresh SSL certs -- not part of the
# backup by design) and then the normal `docker compose up -d --build` for
# api/web/nginx.
#
# Usage: ./scripts/restore-full.sh /path/to/florie-full-backup-<ts>.tar.gz

if [ $# -ne 1 ]; then
  echo "Usage: $0 <backup-file.tar.gz>" >&2
  exit 1
fi

BACKUP_FILE=$(readlink -f "$1")
cd "$(dirname "$0")/.."

if [ -f .env.production ] || [ -f nginx/florie.conf ]; then
  echo "!! .env.production or nginx/florie.conf already exists here." >&2
  echo "   Refusing to overwrite -- this script is meant for a fresh" >&2
  echo "   checkout. Move them aside first if you really mean to restore" >&2
  echo "   on top of an existing deployment, then re-run." >&2
  exit 1
fi

COMPOSE="docker compose --env-file .env.production -f docker-compose.prod.yml"
NETWORK=florie-prod_default
WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT

echo "==> Extracting backup..."
tar xzf "$BACKUP_FILE" -C "$WORKDIR"
cat "$WORKDIR/MANIFEST.txt"
echo

echo "==> Restoring .env.production and nginx/florie.conf..."
cp "$WORKDIR/.env.production" .env.production
cp "$WORKDIR/florie.conf" nginx/florie.conf

echo "==> Starting Postgres + MinIO (fresh volumes, bucket created by minio-init)..."
$COMPOSE up -d postgres minio minio-init

echo "    Waiting for Postgres to become healthy..."
until [ "$(docker inspect -f '{{.State.Health.Status}}' florie-postgres 2>/dev/null)" = "healthy" ]; do
  sleep 2
done
echo "    Waiting for minio-init to finish creating the bucket..."
until [ "$(docker inspect -f '{{.State.Status}}' florie-minio-init 2>/dev/null)" = "exited" ]; do
  sleep 2
done

echo "==> Restoring database..."
$COMPOSE exec -T postgres sh -c \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1' \
  < "$WORKDIR/db.sql"

echo "==> Restoring MinIO objects (product/blog images)..."
set -a; . ./.env.production; set +a
docker run --rm \
  --network "$NETWORK" \
  --entrypoint sh \
  -v "$WORKDIR/minio-media:/backup:ro" \
  quay.io/minio/mc:latest \
  -c "mc alias set dst http://minio:9000 '$MINIO_ROOT_USER' '$MINIO_ROOT_PASSWORD' && mc mirror --quiet /backup dst/$MINIO_BUCKET"

cat <<EOF

==> Restore done. Next steps:
  1. DEPLOYMENT.md Section 4 -- issue FRESH SSL certs for this server's
     domain (not part of the backup; reissuing is free and simple).
  2. Point DNS at this server's new IP, if not already done.
  3. docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
     (builds and starts api/web/nginx)
  4. Verify per DEPLOYMENT.md Section 7.
EOF
