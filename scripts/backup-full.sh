#!/bin/sh
set -eu

# Full, portable backup: Postgres DB + MinIO objects (product/blog images)
# + the config/secrets that only ever existed on this server -- the admin
# UI's Sao luu/Khoi phuc page only covers the database (see
# apps/api/src/backups/backups.service.ts), and .env.production /
# nginx/florie.conf are both deliberately outside git (secrets, and a
# domain-specific hand-edit -- see DEPLOYMENT.md). Run this ON the
# production server, from the repo root.
#
# Usage: ./scripts/backup-full.sh
# Output: backups/florie-full-backup-<timestamp>.tar.gz -- copy this ONE
# file off the server; scripts/restore-full.sh consumes it on the new VPS.

cd "$(dirname "$0")/.."

COMPOSE="docker compose --env-file .env.production -f docker-compose.prod.yml"
NETWORK=florie-prod_default
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT

echo "==> Dumping Postgres database..."
$COMPOSE exec -T postgres sh -c \
  'pg_dump -U "$POSTGRES_USER" --no-owner --no-privileges --clean --if-exists "$POSTGRES_DB"' \
  > "$WORKDIR/db.sql"

echo "==> Exporting MinIO objects (product/blog images)..."
# mc mirror over the S3 API, not a raw tar of the MinIO volume -- confirmed
# by hand that a raw copy of MinIO's internal xl.meta/bucket-registry files
# does not reliably come back as a working bucket after being dropped into a
# fresh volume (mc ls sees zero buckets even though the bytes are on disk).
# Going through mc gives back plain files, which mc mirror on the restore
# side re-uploads as normal objects -- immune to any internal format detail.
set -a; . ./.env.production; set +a
mkdir -p "$WORKDIR/minio-media"
docker run --rm \
  --network "$NETWORK" \
  --entrypoint sh \
  -v "$WORKDIR/minio-media:/backup" \
  quay.io/minio/mc:latest \
  -c "mc alias set src http://minio:9000 '$MINIO_ROOT_USER' '$MINIO_ROOT_PASSWORD' && mc mirror --quiet src/$MINIO_BUCKET /backup"

echo "==> Copying config/secrets..."
cp .env.production "$WORKDIR/.env.production"
cp nginx/florie.conf "$WORKDIR/florie.conf"

cat > "$WORKDIR/MANIFEST.txt" <<EOF
Beo Flower Corner -- full backup
Created: $(date -Iseconds)

Contents:
  db.sql              - Postgres dump (pg_dump --clean --if-exists)
  minio-media/        - MinIO objects (product/blog images etc.), exported
                        via mc mirror -- plain files, mirrored by
                        scripts/restore-full.sh back into a fresh bucket
  .env.production     - server secrets/config (never committed to git)
  florie.conf         - deployed nginx config (hand-edited for the live
                        domain on this server, never synced back to git)

NOT included -- see DEPLOYMENT.md "Migrating to a new VPS":
  SSL certificates -- reissue fresh on the new server with certbot. It's
  free, takes a minute, and avoids dealing with Let's Encrypt account keys.

Restore with: scripts/restore-full.sh <this-file>
EOF

mkdir -p backups
OUT="backups/florie-full-backup-${TIMESTAMP}.tar.gz"
tar czf "$OUT" -C "$WORKDIR" .

echo "==> Done: $OUT"
echo "    Copy this single file off the server, e.g. from your machine:"
echo "    scp -i your-key root@<this-server-ip>:$(pwd)/$OUT ."
