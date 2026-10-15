# TASK-003: Set up Docker Compose (API + PostgreSQL)

## Objective
Create Docker configuration for local development with API and PostgreSQL.

## Steps

1. Create Dockerfile for the API:
   - Multi-stage build (deps → build → runtime)
   - Node:20-alpine base image
   - Copy package.json and pnpm-lock.yaml
   - Install dependencies
   - Copy source and build
   - Runtime stage with minimal dependencies
2. Create docker-compose.yml:
   - api service (build from Dockerfile, port 3000)
   - db service (postgres:16-alpine)
   - Internal network (no DB ports exposed)
   - Health check for DB
   - Volume for PostgreSQL data
3. Create .dockerignore
4. Create .env.example with default values
5. Verify `docker compose up -d` starts both services


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] `docker compose up -d` starts API and DB
- [ ] API is accessible on localhost:3000
- [ ] DB is NOT accessible from host (no exposed ports)
- [ ] DB data persists across restarts (volume)
- [ ] DB health check passes before API starts
