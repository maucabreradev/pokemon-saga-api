# TASK-051: Implement PATCH /topics/:id (edit topic)

## Objective
Allow topic author or mods to edit a topic.

## Steps

1. Create update-topic.dto.ts:
   - title (optional)
   - body (optional)
2. Implement PATCH /api/v1/topics/:id:
   - Require authentication + active character
   - Verify ownership OR mod/admin role
   - Sanitize body if updated
   - Update topic
   - Return updated topic
3. Handle edge cases:
   - Not author and not mod → 403
   - Topic not found → 404
   - Topic locked → 403 (only mod can edit)
4. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] PATCH /topics/:id updates topic
- [ ] Author or mod/admin can edit
- [ ] Body sanitized on update
- [ ] Locked topics only editable by mod
- [ ] Returns updated topic
