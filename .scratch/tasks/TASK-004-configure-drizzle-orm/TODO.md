# TASK-004: Configure Drizzle ORM with PostgreSQL connection

## Objective
Set up Drizzle ORM with PostgreSQL driver for database access.

## Steps

1. Install dependencies:
   - drizzle-orm, pg, @types/pg
   - drizzle-kit (dev)
2. Create drizzle.config.ts:
   - Schema path
   - Migration output directory
   - Database credentials from env
3. Create src/database/:
   - database.module.ts (global module)
   - database.service.ts (connection pool management)
   - database.provider.ts (Drizzle instance provider)
4. Add database scripts to package.json:
   - db:generate, db:migrate, db:push, db:studio
5. Add DATABASE_URL to .env.example
6. Verify connection to Docker PostgreSQL


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Drizzle connects to PostgreSQL in Docker
- [ ] `pnpm db:generate` works (generates empty migration)
- [ ] `pnpm db:migrate` works
- [ ] `pnpm db:studio` opens Drizzle Studio
- [ ] Connection errors are handled gracefully
