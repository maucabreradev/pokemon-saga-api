# TASK-074: Add ownership guards for character content

## Objective
Ensure only content owners can modify their own content.

## Steps

1. Create ownership.guard.ts:
   - Check if current character owns the resource
   - Used for: edit/delete topics, posts, character profiles
2. Apply guard to:
   - PATCH /topics/:id — only author
   - DELETE /topics/:id — only author
   - PATCH /posts/:id — only author
   - DELETE /posts/:id — only author
   - PATCH /characters/:readableId — only owner
   - DELETE /characters/:readableId — only owner
3. Return 403 Forbidden for non-owners
4. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Non-owners cannot edit others' content
- [ ] Non-owners cannot delete others' content
- [ ] Ownership check is efficient (single DB query)
- [ ] Returns 403 Forbidden with clear message
