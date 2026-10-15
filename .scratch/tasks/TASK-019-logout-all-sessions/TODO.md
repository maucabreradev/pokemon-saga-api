# TASK-019: Implement logout-all (revoke all sessions)

## Objective
Revoke all refresh tokens for the current user, logging them out everywhere.

## Steps

1. Implement POST /api/v1/auth/logout-all:
   - Require Bearer token authentication
   - Revoke ALL refresh tokens for the authenticated user
   - Return 204 No Content
2. Get user_id from the authenticated request
3. Update all refresh_tokens where user_id = ? AND revoked_at IS NULL
4. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] POST /api/v1/auth/logout-all revokes all user's refresh tokens
- [ ] All existing sessions are invalidated
- [ ] New login still works after logout-all
- [ ] Requires authentication
