# CHANGELOG — Professional Rebuild (2026-11-11)

Rebuild of LogiTrack (Angular 19 + Spring Boot 3.4.5 + MySQL 8) in `~/workspace/logitrack`.
Nothing was pushed to GitHub. All pre-existing `/api/*` endpoints keep working with the
same shapes; new capabilities are additive (see "Compatibility" below).

## What changed

### Frontend — professional UI
- New design system in `frontend/src/styles.css`: Inter/system font stack, CSS variables,
  light + dark theme (`data-theme="dark"` on `<html>`, toggle in the header, persisted in
  `localStorage`), consistent cards/buttons/badges/tables/forms, focus-visible states,
  responsive breakpoints, skeleton shimmer and empty states.
- Sidebar rebuilt with grouped navigation (Overview / Operations / Master Data / System),
  collapsible on desktop, slide-over on mobile.
- Header rebuilt: global search (tracking number / customer / driver), notifications bell
  with dropdown + unread badge, backend status dot, dark-mode toggle, user menu with logout.
- Dashboard polished: on-time % KPI, 7/30-day trend sparkline (SVG), top hubs and top
  drivers mini-lists, plus the existing KPIs, status donut, recent activity and delayed list.
- All list pages: pagination controls, per-page selector, sort, CSV export, loading skeletons
  and empty/error states. Shipments also gets a Kanban/board toggle, bulk selection with
  bulk cancel, and one-click workflow actions.
- New pages: `/login`, `/analytics` (pure SVG/CSS charts), `/notifications`,
  `/settings` (theme, density, page size, API base URL, demo credentials), and public
  `/track` (no login, no sidebar).
- Auth: `AuthService`, route guard and HTTP interceptor attaching the Bearer JWT;
  401 redirects to `/login`. Demo-mode fallback: if the backend is unreachable the
  Dashboard/Shipments/Analytics show a clearly labelled **DEMO DATA** banner with a
  small built-in dataset — demo data is never presented as live data.

### Backend — new capabilities
- JWT auth (`jjwt` 0.12.6): `POST /api/auth/login`, `GET /api/auth/me`; demo users
  ADMIN / DISPATCHER / VIEWER seeded from environment variables with BCrypt-hashed
  passwords (see `application.properties` / `.env.example`). Spring Security filter chain:
  `/api/auth/**`, `/api/public/**` and `/actuator/health` are public; every other
  `/api/**` endpoint requires a Bearer JWT.
- Pagination: `GET /api/customers|drivers|hubs|shipments|tracking-events` accept optional
  `?page&size&sort&search` and return `{content, page, size, totalElements, totalPages}`.
  **Without `page` they return the original plain JSON array** — existing clients and the
  original integration test keep working unchanged.
- Analytics: `GET /api/dashboard/analytics` (14-day daily created/delivered, on-time %,
  average delivery days, per-hub throughput, driver leaderboard, status mix) and
  `GET /api/dashboard/notifications` (delayed shipments + latest events + unread count).
- CSV export: `GET /api/shipments/export`, `/api/customers/export`, `/api/drivers/export`
  (shipments export respects the same filters as the list endpoint).
- One-click shipment workflow: `POST /api/shipments/{id}/assign-driver`,
  `POST /api/shipments/{id}/advance` (next legal status, appends a tracking event),
  `POST /api/shipments/{id}/cancel`, `POST /api/shipments/{id}/deliver`
  (requires OUT_FOR_DELIVERY, records proof-of-delivery event with `receivedBy`).
- Public tracking: `GET /api/public/track/{trackingNumber}` (no auth, shipment summary +
  timeline only). Actuator: `GET /actuator/health`.
- Business rules kept: legal transitions PENDING → PICKED_UP → IN_TRANSIT →
  OUT_FOR_DELIVERY → DELIVERED, CANCELLED terminal; cannot delete a shipment with tracking
  history; duplicate tracking numbers / codes rejected with clear errors.
- Tests: original `LogisticsEndToEndIntegrationTest` kept (now runs as a mock ADMIN user)
  plus new `AuthAndWorkflowIntegrationTest` (login success/failure, 401 without token,
  public tracking, full assign → advance → deliver → cancel flow) and a pagination/
  analytics/export test in the E2E class.

### Ops & docs
- `docker-compose.yml` (MySQL 8.0 + backend + frontend, healthchecks, named volume),
  `backend/Dockerfile`, `frontend/Dockerfile` + `nginx.conf` (serves the Angular build,
  proxies `/api/` to the backend container).
- `scripts/run-all.sh` / `scripts/run-all.ps1` for local (non-Docker) runs.
- `database/sample-data.sql`: 10 shipments (was 7) spanning the last 13 days with
  delivered-on-time, delayed, in-transit and cancelled examples so analytics has a
  real 14-day trend. `database/schema.sql` untouched.
- `docs/API_DOCUMENTATION.md` updated with every new endpoint; `README.md` rewritten
  for the new feature set, demo login and run instructions.

## Compatibility
- Existing `/api/*` endpoints: same paths, same request/response shapes. The only
  behavioural change is **authentication**: clients must now send
  `Authorization: Bearer <token>` (obtain via `POST /api/auth/login`), except for
  `/api/auth/**`, `/api/public/**` and `/actuator/health`.
- List endpoints return a paged object **only when `?page=` is supplied**; otherwise
  they return the original array.

## Still NOT included (honest scope)
- No GPS / live vehicle tracking, no route optimisation, no SMS/email notifications,
  no payments, no multi-tenant organisations.
- Auth is a demo/small-deployment user store (users from environment variables,
  BCrypt-hashed in memory at startup, JWT signed with a shared secret). It is **not**
  a production identity system: no user registration UI, no password reset, no
  refresh tokens, no per-user data isolation, and the default JWT secret / demo
  passwords must be changed via environment variables before any real deployment.
- No automated UI (browser) tests; backend integration tests cover the API only.
