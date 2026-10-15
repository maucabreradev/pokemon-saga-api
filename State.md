# Project State

**Last updated**: 2026-10-14
**Current phase**: Phase 1 — Foundations

## Current Status

Phase 1 is in progress. TASK-012 (Set up health check endpoint) has been completed. The health check endpoint at `/api/v1/health` now follows NestJS patterns: a `HealthService` owns the check logic (returns status, ISO timestamp, and process uptime) and `HealthController` delegates to it. Both are covered by colocated unit tests written first under strict TDD.

## Last Completed

- **TASK-012** — Set up health check endpoint: Created `src/health/health.service.ts` with `check()` returning `{ status, timestamp, uptime }` plus `HealthStatus` interface. Refactored `HealthController` to inject `HealthService` via DI (no business logic in controller) and updated Swagger example. Registered `HealthService` in `HealthModule`. Added colocated unit tests `health.service.spec.ts` (3 tests) and `health.controller.spec.ts` (1 test) following RED → GREEN → REFACTOR; all 11 tests pass with no regressions.

## Next Task

- **TASK-013** — Configure Git workflow and branch protection rules: Document branch protection for `main`/`develop`, required checks, and review policy.

## Recent Activity

| Date | Task | Summary |
|------|------|---------|
| 2026-10-15 | FIX-002 | .gitattributes (LF) + working tree normalized, test:e2e/test:integration scripts + jest configs, packageManager pin, CI without bc/version pins, lint 0 errors |
| 2026-10-15 | FIX-001 | ThrottlerGuard as APP_GUARD (enforcement now real), ThrottleAuth decorator, Dockerfile healthcheck path + tsconfig.build.json |
| 2026-10-14 | TASK-012 | HealthService with status/timestamp/uptime, controller delegates via DI, colocated unit tests (TDD) |
| 2026-10-14 | TASK-011 | Rate limiting with @nestjs/throttler (global 100/min, auth 5/min), unit tests (TDD) |
| 2026-10-14 | TASK-010 | Helmet security headers, CORS config, unit tests (TDD) |
| 2026-10-14 | TASK-009 | Swagger/OpenAPI setup with Bearer auth, 11 tags, HealthController with decorators |
| 2026-10-14 | TASK-008 | Global exception filters, custom exceptions, validation pipes, response interceptor |
| 2026-10-14 | TASK-007 | Environment configuration with @nestjs/config and Joi validation |
| 2026-10-14 | TASK-006 | Migration generated and applied - 12 tables in PostgreSQL |
| 2026-10-14 | TASK-005 | 12 database tables defined with enums, indexes, FK constraints |
| 2026-10-14 | TASK-004 | Drizzle ORM configured with PostgreSQL connection pool |
| 2026-10-14 | TASK-003 | Docker Compose with internal network and health checks |
| 2026-10-14 | TASK-002 | ESLint 9 with flat config, Prettier, TypeScript globals |
| 2026-10-14 | TASK-001 | NestJS project scaffolded with pnpm |

## Context for Next Session

- Rate limiting: global 100 req/min per IP, auth 5 req/min per IP via named throttlers
- Security headers via Helmet: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, DNS-Prefetch-Control, X-XSS-Protection, hidden X-Powered-By
- CORS configured via `src/config/security.config.ts` with env-based origin
- Swagger UI available at `/api/docs` with Bearer token auth support
- 11 API tags defined for organized documentation
- HealthController at `/api/v1/health` with full Swagger decorators as reference
- Global error handling with standardized JSON responses
- Custom exceptions: AppError, NotFoundError, ConflictError, ForbiddenError, UnauthorizedError, ValidationError, TooManyRequestsError
- Global AllExceptionsFilter and DatabaseExceptionFilter
- ResponseInterceptor adds metadata (timestamp, path, duration)
- Custom ValidationPipe with class-validator and class-transformer
- Tooling: LF enforced via .gitattributes; pnpm pinned via packageManager (12.3.4); test:e2e/test:integration scripts run vacuous until Phase 9 adds *.e2e-spec.ts / *.integration-spec.ts; db:seed deferred to Phase 11 (no seeder code exists yet)
- Rate limiting is now enforced: ThrottlerGuard registered as global APP_GUARD (default 100 req/min); use @ThrottleAuth() (5 req/min) on auth endpoints in Phase 2
- Docker fixed: HEALTHCHECK hits /api/v1/health; tsconfig.build.json gives flat dist output (no specs) so CMD node dist/main works
- Health check at `/api/v1/health` returns `{ status, timestamp, uptime }` via `HealthService`; controller delegates through DI
- Next: TASK-013 - Git workflow and branch protection rules
- Git workflow: feature branch → squash merge → develop → delete feature branch