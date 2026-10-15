# TASK-037: Implement GET /characters/:readableId/friends

## Objective
List all friends of a character.

## Steps

1. Implement GET /api/v1/characters/:readableId/friends:
   - Public endpoint
   - Query friendships where (requester = ? OR addressee = ?) AND status = 'accepted'
   - Join with characters for friend's public info
   - Return: friend readable_id, public_name, avatar_url
2. Handle edge cases:
   - Character not found → 404
   - No friends → empty array
3. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] GET /characters/:readableId/friends returns friends list
- [ ] Only accepted friendships shown
- [ ] Returns friend's public info (not internal data)
