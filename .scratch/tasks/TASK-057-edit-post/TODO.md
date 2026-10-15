# TASK-057: Implement PATCH /posts/:id (edit post)

## Objective
Allow post author or mods to edit a post.

## Steps

1. Create update-post.dto.ts — body (optional, max 10000 chars)
2. Implement PATCH /api/v1/posts/:id:
   - Require authentication + active character
   - Verify ownership OR mod/admin role
   - Sanitize body
   - Update post
   - Set updated_at
   - Return updated post
3. Handle edge cases:
   - Not author and not mod → 403
   - Post not found → 404
4. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] PATCH /posts/:id updates post
- [ ] Author or mod/admin can edit
- [ ] Body sanitized on update
- [ ] Returns updated post
