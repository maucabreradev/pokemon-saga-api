# TASK-064: Implement DELETE /friendships/:id

## Objective
Allow characters to remove a friend.

## Steps

1. Implement DELETE /api/v1/friendships/:id:
   - Require authentication + active character
   - Verify friendship exists
   - Verify current character is a party in the friendship
   - Delete the friendship record
   - Return 204 No Content
2. Handle edge cases:
   - Not a party → 403
   - Friendship not found → 404
3. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] DELETE /friendships/:id removes the friendship
- [ ] Either party can remove
- [ ] Returns 204 No Content
