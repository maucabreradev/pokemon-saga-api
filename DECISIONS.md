# Architecture Decision Records

## ADR-001: NestJS + Express as Framework

**Status**: Accepted

**Context**: Need a robust, modular Node.js framework with TypeScript support and enterprise patterns.

**Decision**: Use NestJS with Express adapter (not Fastify) for maximum ecosystem compatibility and familiarity.

**Consequences**:
- Mature DI container and module system
- Large ecosystem of guards, interceptors, pipes
- Express middleware compatibility
- Slightly more overhead than Fastify

---

## ADR-002: Drizzle ORM

**Status**: Accepted

**Context**: Need type-safe database access without the overhead of a full ORM.

**Decision**: Use Drizzle ORM for its SQL-first approach, excellent TypeScript inference, and minimal runtime overhead.

**Consequences**:
- Full type safety on queries
- SQL-like syntax, easy to debug
- Lightweight compared to Prisma/TypeORM
- Manual migration management

---

## ADR-003: JWT with Refresh Token Rotation

**Status**: Accepted

**Context**: Need stateless authentication with security against token theft.

**Decision**: Access tokens (15 min) + refresh tokens (30 days, rotated on each use, stored as hashes in DB).

**Consequences**:
- Short-lived access tokens limit damage from theft
- Refresh token rotation prevents reuse of stolen tokens
- Logout can revoke all sessions
- Requires database lookup per refresh

---

## ADR-004: Human-Readable Character IDs

**Status**: Accepted

**Context**: Characters need unique, memorable identifiers for URLs and mentions.

**Decision**: Generate IDs as `[Adjective][Noun][Verb][Number]` (e.g., "GreenAppleHunter123"), verified unique in DB. Users can change once.

**Consequences**:
- Memorable and fun for a role-playing forum
- Collision handling with retry logic
- One-time rename prevents abuse

---

## ADR-005: Soft Delete for Characters and Content

**Status**: Accepted

**Context**: Deleted/banned characters should preserve their content history.

**Decision**: Use soft delete (`deleted_at` timestamp) for banned and deleted characters, topics, and posts.

**Consequences**:
- Content history preserved
- Queries must filter deleted records
- Admin can restore if needed

---

## ADR-006: Docker Compose with Internal Network

**Status**: Accepted

**Context**: Database should not be exposed to the internet.

**Decision**: Use Docker Compose with an internal network. Only the API service exposes a port.

**Consequences**:
- Database is only reachable from the API container
- Simple setup, no reverse proxy needed
- Suitable for single-server deployment

---

## ADR-007: Database Seeding in Final Phase

**Status**: Accepted

**Context**: Initial data (categories, forums, admin user) is needed but should not block early development.

**Decision**: Implement seeding as Phase 11 (final phase), after all features are stable.

**Consequences**:
- Can develop with manual data insertion initially
- Seed data designed with full knowledge of the schema
- Less rework if schema changes during development

---

## ADR-008: Global Rate Limiting with a Single Default Bucket

**Status**: Accepted

**Context**: `@nestjs/throttler` v6 `ThrottlerGuard` iterates over every configured named throttler and enforces each one on all routes unless explicitly skipped. The initial setup registered two named throttlers (`global` at 100 req/min, `auth` at 5 req/min) with no guard at all, so nothing was enforced — and registering the guard as-is would have throttled every endpoint down to 5 req/min.

**Decision**: Register `ThrottlerGuard` as a global `APP_GUARD` with a single `default` bucket (100 requests per minute per IP). Stricter buckets are opt-in per route via the `ThrottleAuth()` decorator (5 req/min, to be applied to auth endpoints in Phase 2). Never add a named throttler to the global config unless it should apply to every route.

**Consequences**:
- Rate limiting is actually enforced, proven by test (HTTP 429 with `X-RateLimit-*` headers past the limit)
- Adding a second named throttler to the global config silently tightens all routes — a documented trap for future changes
- Auth endpoints must remember to apply `@ThrottleAuth()` (covered by TASK-022)

---

## ADR-009: ESM Dependencies under Jest CJS via Babel Transform

**Status**: Accepted

**Context**: `@nestjs/config` v12, `@nestjs/swagger` v12 and `@nestjs/mapped-types` ship ESM-only dist files (some using `import.meta`), while Jest runs in CommonJS mode via ts-jest. Importing `AppModule` in e2e/integration tests therefore failed at parse time, blocking the three-layer testing strategy in `TESTING.md`.

**Decision**: In `tests/jest-e2e.json` and `tests/jest-integration.json`, transform all `.js` through babel with `@babel/plugin-transform-modules-commonjs`, and map `@nestjs/swagger` to a test-only stub of no-op decorator factories (`tests/e2e/swagger.stub.js`). The stub is faithful because e2e tests boot `AppModule` directly and never call `SwaggerModule.setup()` — the decorators are inert metadata for HTTP assertions.

**Consequences**:
- E2e/integration tests can import the real `AppModule` today (proven: the health e2e test boots the full module with no database needed, thanks to the lazy connection pool)
- Plain-ESM dependencies work with zero extra config; only `import.meta` files need stub entries
- Rejected alternatives: downgrading the swagger stack to CJS versions (regressing production dependencies to satisfy tests) and migrating Jest to native ESM (touches the entire toolchain; Phase 9 may revisit)

---

## ADR-010: Strict 80% Coverage Gate Despite Current ~14%

**Status**: Superseded (2026-10-15 — coverage runs as informational-only `Coverage` job; see CI workflow and `State.md`)

**Context**: Measured line coverage is ~14% during the foundations phase; the full test pyramid lands in Phase 9 (TASK-082–089). The CI coverage gates fail below 80%.

**Decision**: Keep the strict 80% gate. Lowering it would enshrine low coverage, and a ratchet mechanism adds process machinery for a problem Phase 9 already owns.

**Consequences**:
- CI coverage steps are expected to fail until Phase 9 completes — this is signal, not noise
- Each Phase 9 task visibly moves the number toward the gate
- Lint passes and all test suites pass independently; only the coverage threshold steps stay red

---

## ADR-011: LF Line Endings Enforced via .gitattributes

**Status**: Accepted

**Context**: Prettier is configured with `endOfLine: lf`, but checkouts on Windows materialized CRLF (via `core.autocrlf`), producing ~500 lint errors that masked real ones. Investigation showed the repository blobs were already LF — only working-tree checkouts diverged.

**Decision**: Enforce `* text=auto eol=lf` in `.gitattributes` and normalize the working tree. Per-machine git config is left untouched.

**Consequences**:
- Fresh checkouts stay LF on every OS; Prettier and ESLint agree everywhere
- The one-time normalization touched 39 files with zero content change (verified by identical blob hashes)

---

## ADR-012: Refresh Token Reuse Detection with Family Revocation

**Status**: Accepted

**Context**: Rotation (ADR-003, TASK-017) kills the used token on each refresh, so a legitimate client never presents a revoked token twice. Presenting a revoked-but-unexpired token is therefore a compromise signal: either an attacker replayed a stolen token, or the legitimate client's retry raced rotation.

**Decision**: When `POST /auth/refresh` receives a revoked-but-unexpired token, revoke the entire token family (`revokedAt` on all rows for that user) and return a generic 401. Expired tokens keep the plain 401 without family action (they are unusable either way). No grace window and no idempotent replay: that would require persisting the issued replacement pair (schema change) for a double-submit case that is rare with a well-behaved client.

**Consequences**:
- A stolen current token used by an attacker kills the whole family on the legitimate user's next refresh instead of silently handing the attacker a fresh session window
- False positives log the user out everywhere on client double-submit; accepted tradeoff, documented here
- The `revokeAllForUser` primitive is reused by TASK-019 (logout-all)
- Grace window with idempotent replay stays a deferred refinement if double-submit proves to be a problem in practice

---

## ADR-013: Soft Delete for Users

**Status**: Accepted

**Context**: TASK-028 requires `DELETE /users/me` as a soft delete with character cascade, token revocation, and login blocking. The `users` table had no `deleted_at` column, and ADR-005 scoped soft delete to characters/topics/posts only.

**Decision**: Add nullable `deleted_at` to `users` (migration `0002`). Cascade stays application-level in the service layer (set user `deleted_at`, revoke refresh tokens, soft delete characters); database `ON DELETE CASCADE` foreign keys are unchanged. All user lookups (`login`, `getMe`, updates, lists) filter `WHERE deleted_at IS NULL`. Already-issued access tokens remain valid until expiry (15 min), same tradeoff as bans.

**Consequences**:
- Deleted emails stay reserved (unique constraint) — re-registration after delete stays out of scope
- Migration `0002` is purely additive (single nullable `ADD COLUMN`), safe to apply before the TASK-028 code lands

---

## ADR-014: Babel JS Transform in Unit Tests for ESM-Only Transitive Deps

**Status**: Accepted

**Context**: TASK-050 adds `isomorphic-dompurify` (spec-mandated sanitizer) for topic bodies. Its transitive chain (`jsdom` → `parse5` v8, `html-encoding-sniffer` v7, `@csstools/*` `.mjs`) ships ESM-only files that the unit Jest config (ts-jest, CJS, `node_modules` untransformed) cannot parse. ADR-009 solved the same class of problem for e2e/integration via babel-jest, but unit tests were left out.

**Decision**: Mirror the ADR-009 babel transform (`@babel/plugin-transform-modules-commonjs` plus `@babel/plugin-transform-export-namespace-from` for `parse5` v8's `export * as` syntax) into `jest.config.js`, and widen all three configs' JS pattern to `^.+\.m?js$` so `.mjs` files are covered. e2e/integration configs get the same plugin and pattern because they boot `AppModule`, which now transitively loads the sanitizer.

**Consequences**:
- Unit suites pay the babel transform over `node_modules` JS plus a heavy one-time jsdom load wherever the sanitizer is imported (measured ~95s for the sanitizer spec alone); accepted cost of testing the real sanitizer instead of a mock
- New ESM-only transitive deps need no per-package allowlist — they are transformed by default
- Rejected alternative: swapping DOMPurify for a CJS-only sanitizer (contradicts the TASK-050 acceptance criterion naming DOMPurify)
