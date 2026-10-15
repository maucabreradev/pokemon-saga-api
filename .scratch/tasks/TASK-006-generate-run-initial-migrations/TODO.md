# TASK-006: Generate and run initial migrations

## Objective
Generate Drizzle migrations from schema and apply them to the database.

## Steps

1. Run `pnpm db:generate` to create migration files
2. Verify migration SQL is correct (all tables, indexes, constraints)
3. Run `pnpm db:migrate` against Docker PostgreSQL
4. Verify tables exist in database (check with psql or Drizzle Studio)
5. Verify all constraints and indexes are created


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Migration files generated in src/database/migrations/
- [ ] All 12 tables exist in PostgreSQL
- [ ] All indexes are created
- [ ] All foreign key constraints are in place
- [ ] Migration is idempotent (can run multiple times safely)
