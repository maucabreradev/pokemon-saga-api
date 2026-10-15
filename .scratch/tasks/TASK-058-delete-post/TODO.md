# TASK-058: Implement DELETE /posts/:id (soft delete)

## Objective
Allow post author or mods to soft delete a post.

## Steps

1. Implement DELETE /api/v1/posts/:id:
   - Require authentication + active character
   - Verify ownership OR mod/admin role
   - Soft delete (set is_deleted = true, deleted_at = NOW())
   - Update topic reply_count
   - Return 204 No Content
2. Handle edge cases:
   - Not author and not mod → 403
   - Post not found → 404
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
- [ ] DELETE /posts/:id soft deletes post
- [ ] Author or mod/admin can delete
- [ ] Returns 204 No Content
