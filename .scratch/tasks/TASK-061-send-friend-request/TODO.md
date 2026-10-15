# TASK-061: Implement POST /friendships/request

## Objective
Allow characters to send friend requests to other characters.

## Steps

1. Create create-friendship.dto.ts — addressee_character_id (UUID)
2. Implement POST /api/v1/friendships/request:
   - Require authentication + active character
   - Verify addressee character exists and is active
   - Check not sending to self
   - Check no existing friendship between the two
   - Create friendship with status = 'pending'
   - Return created friendship
3. Handle edge cases:
   - Self-request → 400
   - Duplicate request → 409
   - Already friends → 409
4. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] POST /friendships/request sends friend request
- [ ] Self-request returns 400
- [ ] Duplicate request returns 409
- [ ] Returns 201 Created with friendship data
