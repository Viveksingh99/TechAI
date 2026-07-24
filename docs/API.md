# API Reference — TechAI

Base: `http://localhost:4000/api/v1`  
Auth: `Authorization: Bearer <accessToken>` (and/or httpOnly refresh cookie)

## Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Client registration |
| POST | `/auth/login` | Login → access + refresh |
| POST | `/auth/refresh` | Rotate tokens |
| POST | `/auth/logout` | Revoke refresh |
| GET | `/auth/me` | Current user |
| POST | `/auth/forgot-password` | Request reset |
| POST | `/auth/reset-password` | Complete reset |

## Projects

CRUD projects, members, milestones, sprints, tasks (incl. status for kanban), bugs, time entries, comments, documents, activity log under `/projects`.

## CRM

Companies, contacts, leads, deals, pipeline stages, follow-ups, notes, email history, analytics under `/crm`.

## HR

Employees, attendance, leave, holidays, salary slips, performance reviews, recruitment (jobs, applications, interviews, offers) under `/hr`.

## Finance

Invoices, quotations, expenses, subscriptions, payments, revenue dashboard under `/finance`.

## CMS / Public intake

Blog, categories, tags, media, pages, SEO, FAQs, testimonials, portfolio, case studies, team, services, newsletter, contact, consultation bookings under `/cms`.

## Support / Meetings / Notifications / Clients / Admin / AI / Uploads

See controllers in `apps/api/src/*/`.

## Response envelope

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 },
  "timestamp": "2026-07-24T00:00:00.000Z"
}
```

## Pagination query

`?page=1&limit=20&search=&sortBy=createdAt&sortOrder=desc`
