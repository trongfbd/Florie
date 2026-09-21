# Bèo Flower Corner — Production Deployment Guide

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

**Troubleshooting: `docker build` hangs/times out on `pnpm install`.** Both
Dockerfiles already use a cache mount plus an internal retry loop (each
`pnpm install` invocation gets a fresh retry/timeout budget), so a normal
flaky connection recovers on its own within a few minutes. If it still can't
get through — confirmed once on this project when `registry.npmjs.org`
itself was severely throttled on the network (small metadata requests
taking 40-80s; connection/TLS setup was fine, only the response body was
slow) while `registry.npmmirror.com` served the identical, hash-verified
packages at 10x+ the speed — you can temporarily point pnpm at that mirror:
add a repo-root `.npmrc` with `registry=https://registry.npmmirror.com/`,
add `.npmrc` to the `COPY pnpm-workspace.yaml ...` line in both
`apps/api/Dockerfile` and `apps/web/Dockerfile`, rebuild, then remove both
changes once it succeeds — pnpm-lock.yaml's integrity hashes mean packages
from a different registry can't be silently swapped for something else, but
routing all installs through a third-party mirror by default isn't
something to leave in place without deciding to.

## 0. Just want a free test environment first?

Two free paths, pick by whether you have a card:

- **0A — Oracle Cloud Always Free**: a real VPS, needs a card for identity
  verification (never charged).
- **0B — your own PC + Cloudflare Tunnel**: zero signup, zero card, but your
  PC has to stay on and online while testers use it.

### 0A. Oracle Cloud Always Free (needs a card, never charged)

Everything below — the Docker Compose stack, nginx, real TLS — works
unchanged on Oracle Cloud's **Always Free** tier: a real ARM VPS (up to 4
OCPU / 24 GB RAM, free forever, no trial expiry, no card ever charged) — plus
a free wildcard-DNS trick so you don't need to own a domain to still get
real HTTPS. Good for 1-2 people testing online. When you're ready for real
customers, point a real domain at the same box later — nothing else changes.

1. Create an Oracle Cloud account at cloud.oracle.com (a card is required
   for identity verification only; Always Free resources are never billed).
2. Create a Compute instance → Image: **Canonical Ubuntu 22.04** (the
   **aarch64/ARM** build) → Shape: **VM.Standard.A1.Flex** (Ampere, the
   Always-Free-eligible shape) → 2 OCPU / 12 GB RAM is plenty for 1-2
   testers (up to 4 OCPU / 24 GB total is free, across one or more
   instances). Attach a public IP.
   - If creation fails with "Out of capacity", that availability domain is
     temporarily full for the free shape — retry, or pick a different
     region at signup.
3. Open ports 80 and 443 in **both** places Oracle firewalls by default —
   people usually only open one and traffic silently drops:
   - Cloud-level: the instance's VCN → **Security List** (or NSG) → Ingress
     Rules → add `0.0.0.0/0` for TCP 80 and 443.
   - OS-level: Oracle's Ubuntu image also ships `iptables` rules blocking
     everything but SSH: `sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT`
     (repeat for 443), then persist with `sudo netfilter-persistent save`
     (`sudo apt install iptables-persistent` first if that's missing).
4. Skip DNS entirely — use **sslip.io**, a free service where
   `<anything>.<your-IP-with-dots>.sslip.io` resolves straight to that IP,
   no setup, no account. If your VPS's public IP is `132.145.12.34`, every
   hostname this guide uses maps mechanically:
   - `florie.vn` → `132.145.12.34.sslip.io`
   - `www.florie.vn` → `www.132.145.12.34.sslip.io`
   - `media.florie.vn` → `media.132.145.12.34.sslip.io`

   These resolve publicly, so **certbot in Section 4 still works and issues
   real Let's Encrypt certificates** — no self-signed-cert browser warning,
   nothing to explain to your testers.
5. Continue from **Section 2** below on this VPS, replacing every
   `florie.vn` in this guide, in `nginx/florie.conf`, and in
   `.env.production` with your `<IP>.sslip.io` per the mapping above. DNS
   (Section 1) is not needed — skip straight to Section 2. Everything else —
   Docker install, migrations, admin creation, backups — is identical.

The official images this stack uses (`postgres`, `minio`, `nginx`,
`certbot`, and the `node` base images in the Dockerfiles) all publish
multi-arch builds including `arm64`, so nothing else needs to change to run
on Ampere.

### 0B. No card at all — self-host from your own PC (Cloudflare Tunnel)

No cloud account, no domain, no card. Runs the exact same stack on your
current machine (needs Docker Desktop, which you already have for dev) and
uses **Cloudflare Tunnel** to give it a real public HTTPS URL without
opening any port on your router. Good for a short 1-2 person test; your PC
has to stay on, awake, and online for the whole test window — closing the
tunnel or losing internet takes the site down for testers immediately.

This path uses two new files instead of the ones from Section 0A/1-7,
since there's no domain and no TLS certificate to manage (Cloudflare
terminates HTTPS for you, so the origin can stay plain HTTP):
- `nginx/florie.local.conf` — one host, port 80 only, no certbot.
- `docker-compose.local-test.yml` — same services as
  `docker-compose.prod.yml` minus `certbot`, using the conf file above.

Steps:

1. Install cloudflared: `winget install --id Cloudflare.cloudflared` (or
   grab the `.exe` from Cloudflare's GitHub releases).
2. `cp .env.production.example .env.production` and fill in
   `POSTGRES_PASSWORD` / `MINIO_ROOT_PASSWORD` / `JWT_ACCESS_SECRET` /
   `JWT_CUSTOMER_ACCESS_SECRET` as in Section 3 below. Leave
   `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `CORS_ORIGIN`,
   `MINIO_PUBLIC_URL`, `MEDIA_PUBLIC_HOSTNAME` blank for now — filled in
   next, once you know the tunnel's URL.
3. Start the tunnel **before** building anything — it hands you a public
   hostname immediately, even though nothing is listening on port 80 yet:
   ```powershell
   cloudflared tunnel --url http://localhost:80
   ```
   Keep this window open. It prints something like
   `https://random-words-1234.trycloudflare.com` — that's your public URL
   for this session. It changes if you stop and restart the tunnel, so
   don't close this window during testing.
4. Fill in `.env.production` with that URL (say it's
   `https://random-words-1234.trycloudflare.com`):
   ```
   NEXT_PUBLIC_API_URL=https://random-words-1234.trycloudflare.com
   NEXT_PUBLIC_SITE_URL=https://random-words-1234.trycloudflare.com
   CORS_ORIGIN=https://random-words-1234.trycloudflare.com
   MINIO_PUBLIC_URL=https://random-words-1234.trycloudflare.com/media
   MEDIA_PUBLIC_HOSTNAME=random-words-1234.trycloudflare.com
   ```
5. Build and start everything:
   ```powershell
   docker compose --env-file .env.production -f docker-compose.local-test.yml up -d --build
   ```
6. Run migrations and create the admin user — same commands as Sections 5
   and 6 below, just swap `-f docker-compose.prod.yml` for
   `-f docker-compose.local-test.yml`.
7. Open the tunnel URL from step 3 in a browser to verify, then share it
   with your 1-2 testers.

When you're ready to move to a real VPS (Section 0A or a paid box), come
back to Sections 1-7 as normal — this local path doesn't touch
`docker-compose.prod.yml` or `nginx/florie.conf` at all.

## 1. DNS

*(Skip this section if you followed Section 0A's sslip.io path, or Section
0B, which doesn't use a domain at all.)*

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
  -e ADMIN_NAME='Bèo Flower Corner Admin' \
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

## Migrating to a new VPS (full backup & restore)

The admin UI's Backup & Restore page (`/admin/sao-luu`) and the cron job
above only cover the **database** — not product/blog images (stored in
MinIO, a separate Docker volume), and not `.env.production` or
`nginx/florie.conf`, both deliberately outside git (secrets, and a
domain-specific hand-edit made directly on the server — see Section 4's
note). Copying just the git repo to a new box is missing all of that.

`scripts/backup-full.sh` and `scripts/restore-full.sh` bundle everything
needed into one file:

**On the current server**, from the repo root:
```bash
./scripts/backup-full.sh
# -> backups/florie-full-backup-<timestamp>.tar.gz
```
Copy that single file off the server (`scp`), e.g. to your own machine, then
on to the new VPS.

**On the new VPS**: follow DEPLOYMENT.md Section 2 (install Docker,
`git clone` the repo) — but stop before Section 3/4, since the restore
script fills in `.env.production` and `nginx/florie.conf` for you:
```bash
./scripts/restore-full.sh /path/to/florie-full-backup-<timestamp>.tar.gz
```
This loads the database and MinIO data, then prints the remaining steps:
issue **fresh** SSL certs (Section 4 — certs are intentionally not part of
the backup; reissuing is free and takes a minute, and sidesteps copying
Let's Encrypt account state), point DNS at the new IP, then
`docker compose up -d --build` to bring up api/web/nginx, and verify per
Section 7.

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
