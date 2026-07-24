# TechAI — Software Agency Management Platform

Production-ready monorepo for running a digital software agency: public marketing site, client portal, employee workspace, CRM, project management, HR, finance, CMS, AI tools, and admin console.

## Architecture

```
techAi/
├── apps/
│   ├── web/          # Next.js 15 (App Router) + React 19 + Tailwind
│   └── api/          # NestJS 11 + Prisma 6 + PostgreSQL + Redis
├── docker-compose.yml
├── .github/workflows/ci.yml
└── docs/
```

**Frontend** — Next.js App Router, TanStack Query, Zustand, React Hook Form + Zod, Framer Motion, dark mode  
**Backend** — NestJS feature modules, JWT + refresh tokens, RBAC, throttling, WebSockets  
**Data** — PostgreSQL (Prisma ORM), Redis  
**Storage** — Cloudinary / AWS S3 / local driver  
**Payments** — Stripe + Razorpay hooks  
**AI** — OpenAI with graceful mock fallback  

### Roles & panels

| Role | Primary workspace |
|------|-------------------|
| Super Admin / Admin | `/admin` (+ all panels) |
| Sales | `/crm` |
| HR | `/hr` |
| Project Manager | `/pm` |
| Developer / Designer / QA | `/employee` |
| Client | `/client` |

## Quick start

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or Docker)
- Redis 7 (optional for local; required for caching/WS scale-out)

### 1. Install

```bash
cd apps/api && npm install
cd ../web && npm install
```

### 2. Environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### 3. Database

```bash
# Start Postgres + Redis
docker compose up -d postgres redis

cd apps/api
npx prisma migrate dev --name init
npm run prisma:seed
```

### 4. Run (frontend-only mock mode — default)

The web app ships with `NEXT_PUBLIC_USE_MOCK=true` so dashboards work **without** the Nest API.

```bash
cd apps/web && npm run dev
# → http://localhost:3000
# Login: admin@techai.com / Admin@12345
```

Dummy data lives in `apps/web/src/mock/`. When the backend is ready, set `NEXT_PUBLIC_USE_MOCK=false` and delete that folder.

### 5. Run full stack (API + web)

```bash
# Terminal 1 — API (http://localhost:4000/api/v1)
cd apps/api && npm run start:dev

# Terminal 2 — Web (set NEXT_PUBLIC_USE_MOCK=false first)
cd apps/web && npm run dev
```

### Seed accounts

| Email | Password | Role |
|-------|----------|------|
| `admin@techai.com` | `Admin@12345` | Super Admin |
| Demo PM / Developer / Client | See seed output | Various |

## API overview

Base URL: `http://localhost:4000/api/v1`

| Area | Prefix |
|------|--------|
| Auth | `/auth` |
| Users | `/users` |
| Projects | `/projects` |
| CRM | `/crm` |
| HR | `/hr` |
| Finance | `/finance` |
| CMS | `/cms` |
| Support | `/support` |
| Meetings | `/meetings` |
| Notifications | `/notifications` |
| AI | `/ai` |
| Admin | `/admin` |
| Uploads | `/uploads` |
| Clients | `/clients` |
| WebSocket | `/ws` |

Responses are wrapped as `{ success, data, meta, timestamp }`.

## Public website

Marketing routes under `/`: Home, Services, Technologies, Portfolio, Case Studies, Testimonials, Pricing, Process, Team, Careers, Blog, FAQs, Contact, Consultation. SEO metadata + dark mode + motion.

## Module map (backend)

Each domain follows Controller → Service → Prisma, with DTO validation, JWT + RBAC guards, pagination, and soft deletes where applicable.

## Testing

```bash
cd apps/api && npm test
cd apps/api && npm run test:e2e
```

## Docker (full stack)

```bash
cp apps/api/.env.example apps/api/.env
docker compose up --build
```

## Deployment

### Vercel (frontend only)

In the Vercel project settings:

1. **Root Directory** → `apps/web` (important — do not use `apps/api`)
2. **Framework Preset** → Next.js
3. Environment variables:
   - `NEXT_PUBLIC_USE_MOCK=true` (frontend-only / no API yet)
   - `NEXT_PUBLIC_API_URL=https://your-api.example.com/api/v1` (when backend is live; then set mock to `false`)

Redeploy after changing Root Directory.

### API

Host NestJS separately (Railway, Render, Fly.io, AWS). Vercel is not ideal for the always-on Nest API + WebSockets.

- **Web** → Vercel (`apps/web`, set `NEXT_PUBLIC_API_URL`)
- **API** → AWS ECS / EC2 / Railway with Postgres + Redis
- **CI** → GitHub Actions (`.github/workflows/ci.yml`)

## Security

JWT access + rotating refresh tokens, helmet, CORS, rate limiting, class-validator DTOs, Prisma parameterized queries, audit logs, RBAC.

## License

Proprietary — TechAI
# TechAI
