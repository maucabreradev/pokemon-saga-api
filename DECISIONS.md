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
