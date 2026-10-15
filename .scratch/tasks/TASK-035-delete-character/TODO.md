# TASK-035: Implement DELETE /characters/:readableId (soft delete)

## Objective
Allow users or admins to delete a character (soft delete).

## Steps

1. Implement DELETE /api/v1/characters/:readableId:
   - Require authentication
   - Verify ownership OR admin/mod role
   - Set status = 'deleted', deleted_at = NOW()
   - Do NOT hard delete — preserve content
   - Return 204 No Content
2. Handle edge cases:
   - Not owner and not mod/admin → 403 Forbidden
   - Character not found → 404
   - Already deleted → idempotent 204
3. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] DELETE /characters/:readableId soft deletes character
- [ ] Owner or mod/admin can delete
- [ ] Character's content (topics, posts) preserved
- [ ] Deleted character cannot interact in forum
- [ ] Returns 204 No Content
