# TASK-065: Implement POST /friendships/:id/block

## Objective
Allow characters to block another character.

## Steps

1. Implement POST /api/v1/friendships/:id/block:
   - Require authentication + active character
   - Verify friendship exists
   - Verify current character is a party
   - Set status = 'blocked'
   - Return updated friendship
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
- [ ] POST /friendships/:id/blocks the other character
- [ ] Blocked character cannot send messages or friend requests
- [ ] Returns updated friendship
