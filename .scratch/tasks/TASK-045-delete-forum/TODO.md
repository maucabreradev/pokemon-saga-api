# TASK-045: Implement DELETE /forums/:id (admin)

## Objective
Allow admins to delete a forum.

## Steps

1. Implement DELETE /api/v1/forums/:id:
   - Require authentication + admin role
   - Soft delete forum (set deleted_at) or prevent delete if has topics
   - Option A: Prevent delete if forum has active topics
   - Option B: Soft delete and hide from listing
   - Return 204 No Content
2. Handle edge cases:
   - Non-admin → 403
   - Forum not found → 404
   - Forum has topics → 409 Conflict (must reassign or delete topics first)
3. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] DELETE /forums/:id deletes forum
- [ ] Only admin can delete
- [ ] Forum with topics cannot be deleted (409)
- [ ] Returns 204 No Content on success
