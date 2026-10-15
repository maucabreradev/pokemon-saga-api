# TASK-093: Add database query logging for development

## Objective
Log all database queries in development for debugging.

## Steps

1. Create src/config/database-logger.ts
2. Enable query logging in development:
   - Log query SQL with parameters
   - Log query execution time
   - Highlight slow queries (> 100ms)
3. Disable query logging in production
4. Log format:
   ```
   [DB] SELECT * FROM users WHERE email = $1 — 5ms
   [DB] [SLOW] SELECT ... — 150ms
   ```
5. Make log level configurable via env var (DB_LOG_LEVEL)
6. Verify logging works in development mode


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] All queries logged in development
- [ ] Query execution time included
- [ ] Slow queries highlighted
- [ ] No logging in production
- [ ] Configurable log level
