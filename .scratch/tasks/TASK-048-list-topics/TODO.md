# TASK-048: Implement GET /topics (list with filters and pagination)

## Objective
List topics with filtering and pagination.

## Steps

1. Create topics.module.ts, topics.controller.ts, topics.service.ts
2. Implement GET /api/v1/topics:
   - Respect forum visibility
   - Filter params: forum_id, author_character_id, page, limit, sort
   - Only show non-deleted topics
   - Join with forums (forum name) and characters (author name)
   - Pagination: default page=1, limit=20, max=50
   - Sort options: created_at DESC (default), reply_count DESC, view_count DESC
   - Return paginated response: { data, total, page, limit, totalPages }
3. Handle edge cases:
   - Forum not found → 404
   - No topics → empty data array
4. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] GET /topics returns paginated topic list
- [ ] Filter by forum_id works
- [ ] Filter by author_character_id works
- [ ] Deleted topics excluded
- [ ] Sorting options work correctly
- [ ] Pagination metadata correct
