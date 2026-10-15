# TASK-052: Implement DELETE /topics/:id (soft delete)

## Objective
Allow topic author or mods to soft delete a topic.

## Steps

1. Implement DELETE /api/v1/topics/:id:
   - Require authentication + active character
   - Verify ownership OR mod/admin role
   - Soft delete (set is_deleted = true, deleted_at = NOW())
   - Return 204 No Content
2. Handle edge cases:
   - Not author and not mod → 403
   - Topic not found → 404
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
- [ ] DELETE /topics/:id soft deletes topic
- [ ] Author or mod/admin can delete
- [ ] Deleted topic hidden from listings
- [ ] Returns 204 No Content
