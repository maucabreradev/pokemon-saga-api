# TASK-017: Implement token refresh endpoint with rotation

## Objective
Allow clients to exchange refresh token for new access token, rotating the refresh token.

## Steps

1. Create refresh.dto.ts — refresh_token
2. Implement POST /api/v1/auth/refresh:
   - Hash incoming refresh token
   - Look up in DB by hash
   - Verify not expired, not revoked
   - Generate new access token (15 min)
   - Generate new refresh token (30 days)
   - Revoke old refresh token (set revoked_at)
   - Store new refresh token
   - Return new token pair
3. Handle edge cases:
   - Expired refresh token → 401
   - Revoked refresh token → 401
   - Token not found → 401
4. Unit tests for refresh flow


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Valid refresh token returns new access + refresh token pair
- [ ] Old refresh token is revoked after use
- [ ] Expired refresh token returns 401
- [ ] Reusing revoked refresh token returns 401
- [ ] New refresh token has new 30-day expiry
