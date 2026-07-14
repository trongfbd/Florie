# Florie — Production Deployment Guide

Single VPS, Docker Compose, no Kubernetes/multi-tenant infra — matches this
project's scope (see the `florie-overview` project notes: explicitly no
multi-tenant/microservice/k8s). This guide assumes a fresh Ubuntu 22.04+ VPS
with a public IP and root/sudo access.

**Every command below targeting `docker-compose.prod.yml` includes
`--env-file .env.production`.** Compose only *auto*-loads a file literally
named `.env` for `${...}` substitution in that file (the
`POSTGRES_USER`/`MINIO_ROOT_PASSWORD`/`NEXT_PUBLIC_*` variables it reads) —
a differently-named file is silently ignored, resolving every `${...}` to
an empty string. Don't drop the flag, even for one-off commands. (The
`package.json` `docker:prod:*` scripts already include it, if you'd rather
use those for the routine ones.)

## 1. DNS

Point these records at your VPS's IP before starting TLS setup (certbot's
HTTP-01 challenge needs them resolving first):

| Type | Host | Value |
|------|------|-------|
| A | `florie.vn` | `<VPS IP>` |
| A | `www.florie.vn` | `<VPS IP>` |
| A | `media.florie.vn` | `<VPS IP>` |

## 2. Server prep

```bash
# Docker Engine + Compose plugin (see docs.docker.com/engine/install for your distro)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # log out/in after this

git clone <your-repo-url> florie
cd florie
```

## 3. Configure environment

```bash
cp .env.production.example .env.production
```

Edit `.env.production` and fill in every `CHANGE_ME`:
- `POSTGRES_PASSWORD`, `MINIO_ROOT_PASSWORD` — real random passwords.
- `JWT_ACCESS_SECRET`, `JWT_CUSTOMER_ACCESS_SECRET` — generate each with
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
  **Must be two different values** — these are two intentionally separate
  identity domains (Admin/Staff vs. Customer), see `apps/api/src/customer-auth`.
- `GOOGLE_CLIENT_ID` / `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — same value in both;
  add `https://florie.vn` to the OAuth client's Authorized JavaScript
  origins in Google Cloud Console (Sign-In uses the ID-token flow — no
  redirect URI or client secret needed).
- `GEMINI_API_KEY` — optional; leave blank to ship without AI features (they
  degrade to a clean "not configured" response, never crash the API).

## 4. Obtain TLS certificates (before first `up`)

`nginx/florie.conf`'s HTTPS server blocks always reference
`/etc/letsencrypt/live/<domain>/{fullchain,privkey}.pem` — nginx refuses to
even *start* a `listen ... ssl` block if those files don't exist yet, so a
throwaway self-signed cert has to exist at those exact paths before the
first `docker compose up`. Certbot then overwrites it with the real cert;
the paths never change, so `florie.conf` never needs editing.

```bash
# 1. Throwaway self-signed certs so nginx can start at all. Uses a plain
#    alpine container (not the certbot image, which doesn't reliably ship
#    the openssl CLI) mounted onto the same named volume nginx/certbot use —
#    "florie-prod_certbot_certs" because docker-compose.prod.yml sets an
#    explicit `name: florie-prod` (run `docker volume ls` if this ever
#    doesn't match, e.g. after renaming the project).
docker volume create florie-prod_certbot_certs
docker run --rm -v florie-prod_certbot_certs:/etc/letsencrypt alpine sh -c "
  apk add --no-cache openssl &&
  mkdir -p /etc/letsencrypt/live/florie.vn /etc/letsencrypt/live/media.florie.vn &&
  for d in florie.vn media.florie.vn; do
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout /etc/letsencrypt/live/\$d/privkey.pem \
      -out /etc/letsencrypt/live/\$d/fullchain.pem \
      -subj /CN=localhost
  done
"

# 2. Bring up the full stack — nginx now starts fine (with the fake cert):
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build

# 3. Replace the fake certs with real ones via the webroot method (uses the
#    running nginx's /var/www/certbot mount for the ACME HTTP-01 challenge).
#    --force-renewal is needed because certbot doesn't recognize the
#    throwaway cert as one of its own and would otherwise skip re-issuing:
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot --force-renewal \
  -d florie.vn -d www.florie.vn --email you@example.com --agree-tos --no-eff-email

docker compose --env-file .env.production -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot --force-renewal \
  -d media.florie.vn --email you@example.com --agree-tos --no-eff-email

# 4. Reload nginx to pick up the real certs:
docker compose --env-file .env.production -f docker-compose.prod.yml restart nginx
```

**Renewal**: certificates expire every 90 days. Add a cron job on the host:

```bash
# crontab -e
0 3 * * * cd /path/to/florie && docker compose --env-file .env.production -f docker-compose.prod.yml run --rm certbot renew --webroot -w /var/www/certbot && docker compose --env-file .env.production -f docker-compose.prod.yml restart nginx
```

## 5. Run database migrations (first deploy and every deploy after a schema change)

Migrations are **not** run automatically on container start (deliberate —
auto-migrate-on-boot hides failures and is risky with more than one
replica). Run them as an explicit step:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm api npx prisma migrate deploy
```

## 6. Create the first admin user

There's no public admin-signup endpoint (by design). **Don't run the full
`prisma/seed.ts`** in production — it also creates demo products/orders meant
for local dev. Use the dedicated one-off script instead (idempotent — safe
to re-run, e.g. to reset a forgotten password):

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec \
  -e ADMIN_EMAIL=admin@florie.vn \
  -e ADMIN_PASSWORD='YourRealPassword123!' \
  -e ADMIN_NAME='Florie Admin' \
  api npx ts-node --transpile-only prisma/create-admin.ts
```

## 7. Verify

- `https://florie.vn` — storefront loads, product images render (confirms
  `media.florie.vn` + MinIO are reachable).
- `https://florie.vn/api/docs` — Swagger UI loads.
- `https://florie.vn/admin/dang-nhap` — log in with the admin user from step 6.
- `https://florie.vn/robots.txt` and `/sitemap.xml` — both render.

## Ongoing operations

**Deploying a new version:**
```bash
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm api npx prisma migrate deploy  # only if the schema changed
```

**Database backups**: the admin UI has a built-in Backup & Restore page
(`/admin/sao-luu`, ADMIN role only) for on-demand `pg_dump` downloads and
guarded restores. For unattended backups, add a host cron job instead:

```bash
# crontab -e — nightly dump, keep 14 days. Substitute POSTGRES_USER/
# POSTGRES_DB with whatever you actually set in .env.production.
0 2 * * * docker compose --env-file /path/to/florie/.env.production -f /path/to/florie/docker-compose.prod.yml exec -T postgres \
  pg_dump -U florie florie | gzip > /path/to/backups/florie-$(date +\%F).sql.gz
0 3 * * * find /path/to/backups -name '*.sql.gz' -mtime +14 -delete
```

**Logs**: `docker compose --env-file .env.production -f docker-compose.prod.yml logs -f api` (or `web`, `nginx`, etc.)

**Restarting a single service**: `docker compose --env-file .env.production -f docker-compose.prod.yml restart api`

## What this guide deliberately does not cover

- **Multi-server/HA/load-balancing** — out of scope, this project is
  explicitly single-VPS (see the `florie-overview` project notes).
- **A managed object storage swap (R2/S3)** — self-hosted MinIO is the
  default here, matching dev. `StorageService` (`apps/api/src/storage/`) is
  already an interface specifically so this can be swapped later without
  touching call sites, if MinIO on a single VPS stops being enough.
- **CI/CD** — deploys above are manual (`git pull` + `docker compose up
  --build`). Wiring this to GitHub Actions or similar is a reasonable next
  step once the team wants it, not included here.
