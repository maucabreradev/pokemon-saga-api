# TASK-062: Implement POST /friendships/:id/accept

## Objective
Allow characters to accept incoming friend requests.

## Steps

1. Implement POST /api/v1/friendships/:id/accept:
   - Require authentication + active character
   - Verify friendship exists
   - Verify current character is the addressee (not requester)
   - Verify status = 'pending'
   - Update status = 'accepted'
   - Return updated friendship
2. Handle edge cases:
   - Not the addressee → 403
   - Not pending → 400
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
- [ ] POST /friendships/:id/accept accepts the request
- [ ] Only addressee can accept
- [ ] Non-pending friendships return 400
- [ ] Returns updated friendship
