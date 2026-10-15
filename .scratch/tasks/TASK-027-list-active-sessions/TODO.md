# TASK-027: Implement GET /users/me/sessions

## Objective
List all active sessions (refresh tokens) for the authenticated user.

## Steps

1. Implement GET /api/v1/users/me/sessions:
   - Require authentication
   - Query refresh_tokens where user_id = ? AND revoked_at IS NULL AND expires_at > NOW()
   - Return array of sessions (id, created_at, expires_at)
   - Do NOT return token hashes
2. Add Swagger response decorator
3. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] GET /users/me/sessions returns active sessions
- [ ] Expired/revoked tokens are excluded
- [ ] Token hashes are never exposed
- [ ] Requires authentication
