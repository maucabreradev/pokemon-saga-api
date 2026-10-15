# TASK-049: Implement GET /topics/:id (topic with paginated posts)

## Objective
Return a topic with its posts (paginated).

## Steps

1. Implement GET /api/v1/topics/:id:
   - Respect forum visibility
   - Return topic details: id, title, body, author info, forum info, is_pinned, is_locked, view_count, created_at
   - Increment view_count
   - Include paginated posts (default: page=1, limit=20)
   - Posts ordered by created_at ASC (chronological)
   - Handle nested posts (replies to replies)
2. Handle edge cases:
   - Topic not found → 404
   - Topic deleted → 404
   - Forum not visible → 403
3. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] GET /topics/:id returns topic with posts
- [ ] View count incremented on each view
- [ ] Posts paginated correctly
- [ ] Posts in chronological order
- [ ] Deleted topics return 404
