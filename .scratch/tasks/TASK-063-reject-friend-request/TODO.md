# TASK-063: Implement POST /friendships/:id/reject

## Objective
Allow characters to reject incoming friend requests.

## Steps

1. Implement POST /api/v1/friendships/:id/reject:
   - Require authentication + active character
   - Verify friendship exists
   - Verify current character is the addressee
   - Verify status = 'pending'
   - Delete or mark as rejected
   - Return 204 No Content
2. Handle edge cases:
   - Not the addressee → 403
   - Not pending → 400
3. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] POST /friendships/:id/reject rejects the request
- [ ] Only addressee can reject
- [ ] Returns 204 No Content
