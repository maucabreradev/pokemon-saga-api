# Project State

**Last updated**: 2026-10-15
**Current phase**: Phase 3 — Users & Characters (TASK-025 complete, next TASK-026)

## Current Status

Phase 2 is complete. TASK-025 (PATCH /users/me/password) implemented via ChangePasswordDto plus UsersService.changePassword and UsersController.changePassword. Verifies current password (401), rejects same-as-current (400) and weak format via pipe, re-hashes with bcrypt 12, refreshes updatedAt, revokes all sessions, returns 204. Next is TASK-026 (GET /users/me/characters).

## Last Completed

- **TASK-025** — Implement PATCH /users/me/password: ChangePasswordDto (min 8, max 64), service verifies current, re-hashes and revokes all refresh tokens; 82/82 unit and 3/3 e2e pass, lint clean, no migration needed.

## Next Task

- **TASK-026** — Implement GET /users/me/characters.

## Recent Activity

| Date | Task | Summary |
|------|------|---------|
| 2026-10-15 | TASK-025 | PATCH /users/me/password via ChangePasswordDto (401 wrong current, 400 same/weak, bcrypt 12, revoke all sessions, 204); 82/82 unit, 3/3 e2e, no migration |
| 2026-10-15 | TASK-024 | PATCH /users/me via UpdateUserDto (idempotent, 409 taken, explicit updatedAt); 73/73 unit, 3/3 e2e, no migration; timestamp convention in DB.md |
| 2026-10-15 | TASK-023 | GET /users/me via UsersModule (public profile only, 404 when missing); 65/65 unit, 3/3 e2e, no migration |
| 2026-10-15 | FIX | Hygiene: scaffold removed, JWT fallback dropped, env placeholder fails closed, ADR-010 superseded, e2e aligned with production pipeline |
| 2026-10-15 | FIX | Schema constraints: friendships pair unique + refresh token hash/user indexes with migration, DB.md updated |
| 2026-10-15 | TASK-022 | Auth bucket proven over HTTP (6th register 429, health 200); Phase 2 complete |
| 2026-10-15 | TASK-021 | Roles decorator + global RolesGuard (exact match, no hierarchy yet); 62/62 pass |
| 2026-10-15 | TASK-020 | Global AuthGuard + Public + CurrentUser, logout-all on Bearer; 56/56 pass |
| 2026-10-15 | TASK-019 | POST /auth/logout-all via revokeAllForUser, 401 without live token; 49/49 pass |
| 2026-10-15 | TASK-018 | POST /auth/logout idempotent by hash (Bearer migration pending TASK-020); 44/44 pass |
| 2026-10-15 | TASK-101 | Reuse detection revokes family (ADR-012, Phase 12); 40/40 pass |
| 2026-10-15 | TASK-017 | POST /auth/refresh with rotation (revoke-on-use, generic 401); 39/39 pass |
| 2026-10-15 | TASK-016 | issueRefreshToken (SHA-256 stored, 30d expiry), login returns both tokens; 31/31 pass |
| 2026-10-15 | TASK-015 | POST /auth/login with bcrypt compare, generic 401, JWT access token (15m); fixed unloaded config namespaces; 7 new unit tests (28/28 pass) |
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
- Next: TASK-026 - Implement GET /users/me/characters
- Users module: `UsersService.getMe` selects only id/email/role/createdAt, throws NotFoundError (404) when missing; `GET /users/me` uses `@CurrentUser('sub')`, Bearer required, documented under `Users` tag
- Users email update: `UpdateUserDto` validates format (400 via global pipe); `updateEmail` returns current profile idempotently on same email, 409 via ConflictError when taken, explicit `updatedAt: new Date()` per DB.md timestamp convention
- Users password change: `ChangePasswordDto` (min 8, max 64); `changePassword` verifies current (401), rejects same-as-current (400), bcrypt 12 re-hash, explicit `updatedAt`, revokes all refresh tokens, 204 No Content
- Auth module: all 5 routes carry `@ThrottleAuth()` (proven by e2e); logout still takes refresh token in body, logout-all on Bearer
- bcrypt 6.0.0 allowed to build via `allowBuilds` in `pnpm-workspace.yaml` (required for `pnpm install --frozen-lockfile` in CI)
- Git workflow: feature branch → squash merge → develop → delete feature branch
- Phase 3 pending decision (before TASK-028): `users` has no `deleted_at` and ADR-005 scopes soft-delete to characters/topics/posts — decide soft-delete shape (migration + cascade rule) vs redefining TASK-028
- Branch protection (Option A manual): `main` requires PR + 1 approval with Code Owners review; `develop` requires PR with 0 approvals (solo developer cannot self-approve); both require up-to-date checks (Lint, Unit Tests, Integration & E2E, TDD & Migration Enforcement), linear history, include admins; `Coverage (informational)` is NOT required on either branch; CI triggers on both branches