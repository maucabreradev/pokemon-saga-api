# TASK-085: Write integration tests for auth endpoints

## Objective
Test auth endpoints with real database interaction.

## Steps

1. Create tests/integration/auth/auth.e2e-spec.ts
2. Setup test database (separate from dev/prod)
3. Run migrations before tests
4. Test registration endpoint:
   - POST /api/v1/auth/register with valid data
   - POST /api/v1/auth/register with duplicate email
   - POST /api/v1/auth/register with invalid data
5. Test login endpoint:
   - POST /api/v1/auth/login with valid credentials
   - POST /api/v1/auth/login with invalid credentials
6. Test refresh endpoint:
   - POST /api/v1/auth/refresh with valid token
   - POST /api/v1/auth/refresh with expired token
7. Test logout endpoints
8. Truncate tables between tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] All auth endpoints tested with real DB
- [ ] Happy path and error cases covered
- [ ] Tests are isolated (truncate between tests)
- [ ] Tests can run in any order
- [ ] All tests pass
