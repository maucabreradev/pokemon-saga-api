# TASK-018: Implement logout (single session)

## Objective
Revoke the current refresh token to log out of a single session.

## Steps

1. Create logout.dto.ts — refresh_token
2. Implement POST /api/v1/auth/logout:
   - Require Bearer token authentication
   - Hash incoming refresh token
   - Look up and revoke (set revoked_at)
   - Return 204 No Content
3. Handle edge cases:
   - Token already revoked → still return 204 (idempotent)
   - Token not found → 401
4. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] POST /api/v1/auth/logout revokes the given refresh token
- [ ] Revoked token can no longer be used for refresh
- [ ] Idempotent — revoking already revoked token succeeds
- [ ] Requires authentication
