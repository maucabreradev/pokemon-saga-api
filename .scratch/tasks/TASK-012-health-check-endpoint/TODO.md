# TASK-012: Set up health check endpoint

## Objective
Create a health check endpoint for monitoring and Docker health checks.

## Steps

1. Install @nestjs/terminus
2. Create src/modules/health/:
   - health.module.ts
   - health.controller.ts
3. Implement health indicators:
   - Database health check (ping PostgreSQL)
   - Disk health check (optional)
   - Memory health check (optional)
4. Endpoint: GET /health
   - Returns 200 OK if all checks pass
   - Returns 503 Service Unavailable if any check fails
5. Configure Docker health check for API service:
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
     interval: 30s
     timeout: 10s
     retries: 3
   ```


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] GET /health returns 200 with status details when healthy
- [ ] GET /health returns 503 when database is unreachable
- [ ] Docker health check passes
- [ ] Response includes database connection status
