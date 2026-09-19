# Bèo Flower Corner
Web bán hoa - Mỗi bó hoa, một câu chuyện.

## Cấu trúc dự án

```
Florie/
├── apps/
│   ├── web/   # Next.js (App Router) — storefront + admin dashboard
│   └── api/   # NestJS + Prisma + PostgreSQL — REST API
├── docker-compose.yml   # Postgres + MinIO cho môi trường dev
└── .env.example
```

## Yêu cầu môi trường

- Node.js >= 20
- pnpm >= 10 (`npm install -g pnpm`)
- Docker + Docker Compose

## Bắt đầu (dev)

```bash
# 1. Copy env mẫu (chỉnh lại nếu cần)
cp .env.example .env
cp .env.example apps/api/.env      # DATABASE_URL, PORT, CORS_ORIGIN
cp .env.example apps/web/.env.local  # NEXT_PUBLIC_API_URL

# 2. Cài dependencies
pnpm install

# 3. Khởi động Postgres + MinIO
pnpm docker:up

# 4. Tạo Prisma client
pnpm --filter api exec prisma generate

# 5. Chạy song song web (http://localhost:3000) và api (http://localhost:4000)
pnpm dev
```

- Swagger docs: http://localhost:4000/api/docs
- MinIO console: http://localhost:9001

## Sprint hiện tại

Xem tiến độ sprint trong lịch sử commit / trao đổi với đội dự án. Sprint 0 (khởi tạo dự án) thiết lập monorepo, Docker stack, và health-check end-to-end (Web → API → Database).
