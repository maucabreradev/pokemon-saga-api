# TASK-055: Implement POST /posts (create comment)

## Objective
Allow characters to create posts/replies in topics.

## Steps

1. Create posts.module.ts, posts.controller.ts, posts.service.ts
2. Create create-post.dto.ts:
   - topic_id (required, valid UUID)
   - parent_post_id (optional, for nested replies)
   - body (required, max 10000 chars)
3. Implement POST /api/v1/posts:
   - Require authentication + active character
   - Verify topic exists, not deleted, not locked
   - Verify forum is visible
   - If parent_post_id provided, verify it exists in same topic
   - Sanitize body with DOMPurify
   - Create post
   - Update topic reply_count
   - Return created post
4. Handle edge cases:
   - No active character → 403
   - Topic locked → 403
   - Topic deleted → 404
5. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] POST /posts creates new post
- [ ] Requires active character
- [ ] Supports nested replies via parent_post_id
- [ ] Body sanitized with DOMPurify
- [ ] Locked topics reject new posts
- [ ] Returns 201 Created with post data
