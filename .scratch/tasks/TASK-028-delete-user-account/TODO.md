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
   - Already deleted → idempotent 204 (D1); 404 only when the row is missing
3. Unit tests

## Contract Decisions (confirmed, see ADR-013)

- **D1** — Already-deleted → idempotent 204; 404 only when the row is missing.
- **D2** — `POST /auth/login` filters `deleted_at IS NULL`, generic 401
  (`'Invalid email or password'`, no user-enumeration via deleted status).
- **D3** — `isNull(deletedAt)` filter on: `login`, `getMe`, `updateEmail`,
  `changePassword`, `deleteMe`. Lists (`getMyCharacters`, `getMySessions`) and
  `register` unchanged (cascade empties lists; deleted emails stay reserved).
- **D4** — Characters cascade sets `status = 'deleted'` + `deletedAt` (+
  `updatedAt` per DB.md timestamp convention).
- **D5** — The three writes run in a single `db.transaction`.


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
