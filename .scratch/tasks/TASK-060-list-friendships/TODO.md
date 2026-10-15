# TASK-060: Implement GET /friendships (list friends)

## Objective
List all friendships for the authenticated character.

## Steps

1. Create friendships.module.ts, friendships.controller.ts, friendships.service.ts
2. Implement GET /api/v1/friendships:
   - Require authentication + active character
   - Query all accepted friendships for this character
   - Return friends list with: character readable_id, public_name, avatar_url, friendship created_at
   - Support filtering by status (pending, accepted, blocked)
3. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] GET /friendships returns character's friends
- [ ] Only accepted friendships shown by default
- [ ] Filter by status works
- [ ] Requires active character
