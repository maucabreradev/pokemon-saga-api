# Implementation Tasks

Tasks are organized by phase. Each task lives in `.scratch/tasks/<task-number>-<description>/` with a detailed TODO file.

**TDD is mandatory for every task.** Follow RED → GREEN → REFACTOR before marking any task as complete. See `AGENTS.md` for the full TDD workflow and `TESTING.md` for the testing strategy.

**Schema changes require migrations.** Any task that modifies the database schema MUST generate a migration with `pnpm db:generate` and commit it alongside the change. See `AGENTS.md` → Database Migrations.

---

## Phase 1 — Foundations

- [x] **TASK-001** — Initialize NestJS project with pnpm
- [x] **TASK-002** — Configure TypeScript, ESLint, Prettier
- [x] **TASK-003** — Set up Docker Compose (API + PostgreSQL)
- [x] **TASK-004** — Configure Drizzle ORM with PostgreSQL connection
- [x] **TASK-005** — Create database schema (all tables)
- [x] **TASK-006** — Generate and run initial migrations
- [x] **TASK-007** — Set up environment configuration
- [x] **TASK-008** — Implement global exception filter and error handling
- [x] **TASK-009** — Set up Swagger/OpenAPI documentation
- [x] **TASK-010** — Configure Helmet, CORS, and security headers
- [x] **TASK-011** — Implement rate limiting with @nestjs/throttler
- [x] **TASK-012** — Set up health check endpoint
- [x] **TASK-013** — Configure Git workflow and branch protection rules

## Phase 2 — Authentication

- [x] **TASK-014** — Implement user registration endpoint
- [x] **TASK-015** — Implement user login with JWT access token
- [x] **TASK-016** — Implement refresh token generation and storage
- [ ] **TASK-017** — Implement token refresh endpoint with rotation
- [ ] **TASK-018** — Implement logout (single session)
- [ ] **TASK-019** — Implement logout-all (revoke all sessions)
- [ ] **TASK-020** — Create AuthGuard and @CurrentUser decorator
- [ ] **TASK-021** — Create @Roles() decorator and RolesGuard
- [ ] **TASK-022** — Add rate limiting to auth endpoints

## Phase 3 — Users & Characters

- [ ] **TASK-023** — Implement GET /users/me endpoint
- [ ] **TASK-024** — Implement PATCH /users/me (update email)
- [ ] **TASK-025** — Implement PATCH /users/me/password
- [ ] **TASK-026** — Implement GET /users/me/characters
- [ ] **TASK-027** — Implement GET /users/me/sessions
- [ ] **TASK-028** — Implement DELETE /users/me (soft delete)
- [ ] **TASK-029** — Implement character creation (max 3 per user)
- [ ] **TASK-030** — Implement human-readable ID generator
- [ ] **TASK-031** — Implement GET /characters/:readableId (public profile)
- [ ] **TASK-032** — Implement PATCH /characters/:readableId (edit profile)
- [ ] **TASK-033** — Implement PATCH /characters/:readableId/readable-id (one-time rename)
- [ ] **TASK-034** — Implement POST /characters/:readableId/set-main
- [ ] **TASK-035** — Implement DELETE /characters/:readableId (soft delete)
- [ ] **TASK-036** — Implement GET /characters/:readableId/topics
- [ ] **TASK-037** — Implement GET /characters/:readableId/friends
- [ ] **TASK-038** — Implement GET /characters/:readableId/posts

## Phase 4 — Forums

- [ ] **TASK-039** — Implement GET /forums (full tree)
- [ ] **TASK-040** — Implement GET /forums/:id (forum detail)
- [ ] **TASK-041** — Implement POST /forums/categories (admin)
- [ ] **TASK-042** — Implement POST /forums (admin)
- [ ] **TASK-043** — Implement PATCH /forums/:id (admin)
- [ ] **TASK-044** — Implement PATCH /forums/:id/visibility (admin)
- [ ] **TASK-045** — Implement DELETE /forums/:id (admin)
- [ ] **TASK-046** — Implement PATCH /forums/:id/order (admin)
- [ ] **TASK-047** — Implement forum visibility guard (public/registered/characters_only)

## Phase 5 — Topics & Posts

- [ ] **TASK-048** — Implement GET /topics (list with filters and pagination)
- [ ] **TASK-049** — Implement GET /topics/:id (topic with paginated posts)
- [ ] **TASK-050** — Implement POST /topics (create topic)
- [ ] **TASK-051** — Implement PATCH /topics/:id (edit topic)
- [ ] **TASK-052** — Implement DELETE /topics/:id (soft delete)
- [ ] **TASK-053** — Implement PATCH /topics/:id/pin (mod/admin)
- [ ] **TASK-054** — Implement PATCH /topics/:id/lock (mod/admin)
- [ ] **TASK-055** — Implement POST /posts (create comment)
- [ ] **TASK-056** — Implement GET /posts/:id
- [ ] **TASK-057** — Implement PATCH /posts/:id (edit post)
- [ ] **TASK-058** — Implement DELETE /posts/:id (soft delete)
- [ ] **TASK-059** — Implement DOMPurify sanitization for topic/post bodies

## Phase 6 — Social Features

- [ ] **TASK-060** — Implement GET /friendships (list friends)
- [ ] **TASK-061** — Implement POST /friendships/request
- [ ] **TASK-062** — Implement POST /friendships/:id/accept
- [ ] **TASK-063** — Implement POST /friendships/:id/reject
- [ ] **TASK-064** — Implement DELETE /friendships/:id
- [ ] **TASK-065** — Implement POST /friendships/:id/block
- [ ] **TASK-066** — Implement POST /reactions (add reaction)
- [ ] **TASK-067** — Implement DELETE /reactions/:id

## Phase 7 — Moderation

- [ ] **TASK-068** — Implement POST /moderation/ban
- [ ] **TASK-069** — Implement POST /moderation/unban
- [ ] **TASK-070** — Implement POST /moderation/silence (temporary)
- [ ] **TASK-071** — Implement POST /moderation/unsilence
- [ ] **TASK-072** — Implement GET /moderation/logs
- [ ] **TASK-073** — Implement silence expiration check on auth

## Phase 8 — Security & Resilience

- [ ] **TASK-074** — Add ownership guards for character content
- [ ] **TASK-075** — Implement banned character access restriction
- [ ] **TASK-076** — Add absent user status logic
- [ ] **TASK-077** — Implement graceful shutdown handling
- [ ] **TASK-078** — Add request validation pipes globally
- [ ] **TASK-079** — Implement response transformation interceptor
- [ ] **TASK-080** — Add security audit logging

## Phase 9 — Testing

- [ ] **TASK-081** — Set up Jest configuration and test environment
- [ ] **TASK-082** — Write unit tests for auth service
- [ ] **TASK-083** — Write unit tests for character service
- [ ] **TASK-084** — Write unit tests for readable ID generator
- [ ] **TASK-085** — Write integration tests for auth endpoints
- [ ] **TASK-086** — Write integration tests for character endpoints
- [ ] **TASK-087** — Write e2e tests for topics and posts
- [ ] **TASK-088** — Write e2e tests for friendships and reactions
- [ ] **TASK-089** — Write e2e tests for moderation actions

## Phase 10 — Polish

- [ ] **TASK-090** — Add Swagger decorators to all endpoints
- [ ] **TASK-091** — Review and improve error messages
- [ ] **TASK-092** — Optimize database queries (N+1 prevention)
- [ ] **TASK-093** — Add database query logging for development
- [ ] **TASK-094** — Write API usage examples in documentation
- [ ] **TASK-095** — Final security review and hardening

## Phase 11 — Seeders

- [ ] **TASK-096** — Create seeder for initial categories
- [ ] **TASK-097** — Create seeder for initial forums
- [ ] **TASK-098** — Create seeder for admin user account
- [ ] **TASK-099** — Create seeder for demo characters and content
- [ ] **TASK-100** — Final integration test with seeded data
