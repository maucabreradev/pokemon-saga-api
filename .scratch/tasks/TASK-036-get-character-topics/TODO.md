# TASK-036: Implement GET /characters/:readableId/topics

## Objective
List all topics created by a character.

## Steps

1. Implement GET /api/v1/characters/:readableId/topics:
   - Public endpoint
   - Query topics where author_character_id = ? AND is_deleted = false
   - Join with forums for forum name
   - Support pagination (page, limit params)
   - Return: id, title, forum_name, reply_count, created_at
2. Handle edge cases:
   - Character not found → 404
   - No topics → empty array
3. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] GET /characters/:readableId/topics returns character's topics
- [ ] Deleted topics excluded
- [ ] Pagination works correctly
- [ ] Ordered by created_at DESC
