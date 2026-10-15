# TASK-067: Implement DELETE /reactions/:id

## Objective
Allow characters to remove their reaction.

## Steps

1. Implement DELETE /api/v1/reactions/:id:
   - Require authentication + active character
   - Verify reaction exists
   - Verify ownership (only the character who created it)
   - Delete reaction
   - Return 204 No Content
2. Handle edge cases:
   - Not owner → 403
   - Reaction not found → 404
3. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] DELETE /reactions/:id removes the reaction
- [ ] Only owner can remove
- [ ] Returns 204 No Content
