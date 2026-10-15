# TASK-038: Implement GET /characters/:readableId/posts

## Objective
List all posts created by a character.

## Steps

1. Implement GET /api/v1/characters/:readableId/posts:
   - Public endpoint
   - Query posts where author_character_id = ? AND is_deleted = false
   - Join with topics for topic title
   - Support pagination (page, limit params)
   - Return: id, topic_title, body_preview, created_at
2. Handle edge cases:
   - Character not found → 404
   - No posts → empty array
3. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] GET /characters/:readableId/posts returns character's posts
- [ ] Deleted posts excluded
- [ ] Pagination works correctly
- [ ] Ordered by created_at DESC
