# TASK-056: Implement GET /posts/:id

## Objective
Return a single post by ID.

## Steps

1. Implement GET /api/v1/posts/:id:
   - Respect forum visibility
   - Return post details: id, body, author info, topic_id, parent_post_id, created_at, updated_at
   - Include reply count (direct replies)
2. Handle edge cases:
   - Post not found → 404
   - Post deleted → 404
3. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] GET /posts/:id returns post details
- [ ] Deleted posts return 404
- [ ] Non-existent posts return 404
