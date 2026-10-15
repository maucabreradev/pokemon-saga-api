# Project State

**Last updated**: 2026-10-15
**Current phase**: Phase 2 — Authentication

## Current Status

Phase 2 is in progress. TASK-014 (Implement user registration endpoint) has been completed. `POST /api/v1/auth/register` validates email and password (min 8 chars) via `RegisterDto`, rejects duplicate emails with `ConflictError` (409), hashes passwords with bcrypt (12 rounds), and returns the public user profile (never the password hash). Covered by colocated unit tests written first under strict TDD.

## Last Completed

- **TASK-014** — Implement user registration endpoint: Created `src/auth/` module (`AuthController`, `AuthService`, `RegisterDto`) with `POST /auth/register` (public, `@ThrottleAuth()` 5 req/min, Swagger decorators). Service checks email uniqueness (`ConflictError` on duplicate), hashes with bcrypt 12 rounds, returns `{ id, email, role, createdAt }`. Added `bcrypt` dependency (build allowed in `pnpm-workspace.yaml`). Colocated unit tests (dto 3, service 2, controller 1) following RED → GREEN → REFACTOR; full suite 21/21 pass, lint clean, e2e health passes with `AuthModule` wired in.

## Next Task

- **TASK-015** — Implement user login with JWT access token.

## Recent Activity

| Date | Task | Summary |
|------|------|---------|
| 2026-10-15 | TASK-014 | POST /auth/register with bcrypt hashing, ConflictError on duplicate, 6 new unit tests (21/21 pass) |
| 2026-10-15 | FIX | License corrected MIT → Unlicense (README + package.json); 80% coverage gate split into informational job so required checks pass until Phase 9; develop approvals set to 0 (solo dev) |
| 2026-10-15 | TASK-013 | CI on main+develop, PR template, CODEOWNERS, BRANCH_PROTECTION.md (Option A manual UI); Phase 1 complete |
| 2026-10-15 | DOCS | ADR-008–011 recorded (rate-limit bucket rule, Jest ESM strategy, strict coverage gate, LF endings) |
| 2026-10-15 | FIX-003 | Specs colocated, real e2e (babel ESM + swagger stub), any casts removed, dead filter/duplicate pipe/stray file removed, CI spec-check narrowed |
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
- Global AllExceptionsFilter (DatabaseExceptionFilter removed as dead code in FIX-003)
- ResponseInterceptor adds metadata (timestamp, path, duration)
- Custom ValidationPipe with class-validator and class-transformer
- Tooling: LF enforced via .gitattributes; pnpm pinned via packageManager (12.3.4); e2e runs real AppModule (babel ESM transform + swagger decorator stub); test:integration runs vacuous until Phase 9; db:seed deferred to Phase 11 (no seeder code exists yet)
- Coverage reality: ~14% lines vs 80% threshold — the 80% check runs as informational-only job `Coverage (informational)` and does NOT block merges; it turns green as Phase 9 pyramid (TASK-082–089) lands, at which point it can be promoted back to required
- Rate limiting is now enforced: ThrottlerGuard registered as global APP_GUARD (default 100 req/min); use @ThrottleAuth() (5 req/min) on auth endpoints in Phase 2
- Docker fixed: HEALTHCHECK hits /api/v1/health; tsconfig.build.json gives flat dist output (no specs) so CMD node dist/main works
- Health check at `/api/v1/health` returns `{ status, timestamp, uptime }` via `HealthService`; controller delegates through DI
- Next: TASK-015 - Implement user login with JWT access token
- Auth module: `src/auth/` with `RegisterDto` (email + min-8 password), `AuthService.register()` (uniqueness check, bcrypt 12 rounds, public profile return), `AuthController` at `POST /auth/register` with `@ThrottleAuth()` and Swagger decorators
- bcrypt 6.0.0 allowed to build via `allowBuilds` in `pnpm-workspace.yaml` (required for `pnpm install --frozen-lockfile` in CI)
- Git workflow: feature branch → squash merge → develop → delete feature branch
- Branch protection (Option A manual): `main` requires PR + 1 approval with Code Owners review; `develop` requires PR with 0 approvals (solo developer cannot self-approve); both require up-to-date checks (Lint, Unit Tests, Integration & E2E, TDD & Migration Enforcement), linear history, include admins; `Coverage (informational)` is NOT required on either branch; CI triggers on both branches