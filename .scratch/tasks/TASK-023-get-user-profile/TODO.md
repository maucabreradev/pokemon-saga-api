# TASK-023: Implement GET /users/me endpoint

## Objective
Return the authenticated user's profile.

## Steps

1. Create users.module.ts, users.controller.ts, users.service.ts
2. Implement GET /api/v1/users/me:
   - Require authentication
   - Return user profile (id, email, role, created_at)
   - Do NOT return password hash or sensitive data
3. Add Swagger response decorator
4. Unit test for service method


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] GET /users/me returns authenticated user's profile
- [ ] Requires valid Bearer token
- [ ] Does not expose password hash
- [ ] Returns 401 if not authenticated
