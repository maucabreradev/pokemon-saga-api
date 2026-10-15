# TASK-025: Implement PATCH /users/me/password

## Objective
Allow users to change their password.

## Steps

1. Create change-password.dto.ts:
   - current_password (required)
   - new_password (min 8, max 64, complexity)
2. Implement PATCH /api/v1/users/me/password:
   - Require authentication
   - Verify current password
   - Validate new password strength
   - Hash new password with bcrypt
   - Update user record
   - Revoke all refresh tokens (force re-login)
   - Return 204 No Content
3. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] PATCH /users/me/password changes password
- [ ] Wrong current password returns 401
- [ ] Weak new password returns 400
- [ ] All existing sessions revoked after password change
- [ ] Old password no longer works for login
