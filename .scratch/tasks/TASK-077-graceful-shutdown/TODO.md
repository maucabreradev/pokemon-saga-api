# TASK-077: Implement graceful shutdown handling

## Objective
Ensure the API shuts down gracefully, closing all connections.

## Steps

1. Enable shutdown hooks in main.ts:
   ```typescript
   app.enableShutdownHooks();
   ```
2. Handle SIGTERM and SIGINT signals
3. On shutdown:
   - Stop accepting new connections
   - Wait for in-flight requests to complete (with timeout)
   - Close database connection pool
   - Close HTTP server
   - Exit process
4. Add timeout (30s max) for forced shutdown
5. Log shutdown events


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] API responds to SIGTERM/SIGINT
- [ ] In-flight requests complete before shutdown
- [ ] Database connections closed cleanly
- [ ] Process exits with code 0 on graceful shutdown
- [ ] Forced shutdown after 30s timeout
