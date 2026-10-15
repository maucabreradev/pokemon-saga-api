# TASK-028: Implement DELETE /users/me (soft delete)

## Objective
Allow users to delete their own account (soft delete).

## Steps

1. Implement DELETE /api/v1/users/me:
   - Require authentication
   - Soft delete user (set deleted_at timestamp)
   - Revoke all refresh tokens
   - Soft delete all user's characters
   - Return 204 No Content
2. Handle edge cases:
   - Already deleted → 404 or idempotent 204
3. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] DELETE /users/me soft deletes user account
- [ ] All characters soft deleted
- [ ] All refresh tokens revoked
- [ ] Deleted user cannot login
- [ ] Requires authentication
