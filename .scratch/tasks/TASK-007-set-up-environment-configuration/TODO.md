# TASK-007: Set up environment configuration

## Objective
Create a centralized, type-safe environment configuration system.

## Steps

1. Install @nestjs/config
2. Create src/config/ directory:
   - configuration.ts — main config factory
   - validation.schema.ts — Joi or class-validator schema for env vars
3. Load environment variables from .env file
4. Define configuration for:
   - Database (DATABASE_URL, DB_POOL_SIZE)
   - JWT (JWT_SECRET, JWT_EXPIRY, JWT_REFRESH_EXPIRY)
   - Server (PORT, NODE_ENV, CORS_ORIGIN)
   - Rate limiting (TTL, LIMIT)
   - App (API_PREFIX, API_VERSION)
5. Create .env.example with all required variables
6. Add config module to app.module.ts
7. Validate env vars on startup (fail fast on missing required vars)


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] All env vars loaded from .env file
- [ ] Missing required env vars cause startup failure with clear message
- [ ] Config is accessible via NestJS ConfigService throughout app
- [ ] .env.example documents all required variables
- [ ] Different configs for development/production/test environments
