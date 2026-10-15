# TASK-024: Implement PATCH /users/me (update email)

## Objective
Allow users to update their email address.

## Steps

1. Create update-user.dto.ts — email (valid format, unique)
2. Implement PATCH /api/v1/users/me:
   - Require authentication
   - Validate new email format
   - Check email uniqueness (not already taken by another user)
   - Update user record
   - Return updated profile
3. Handle edge cases:
   - Same email as current → return current (idempotent)
   - Email already taken → 409 Conflict
4. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] PATCH /users/me updates user email
- [ ] Duplicate email returns 409 Conflict
- [ ] Invalid email format returns 400
- [ ] Requires authentication
