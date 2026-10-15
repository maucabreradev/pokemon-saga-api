# TASK-053: Implement PATCH /topics/:id/pin (mod/admin)

## Objective
Allow mods/admins to pin a topic to the top of the forum.

## Steps

1. Implement PATCH /api/v1/topics/:id/pin:
   - Require authentication + mod/admin role
   - Set is_pinned = true
   - Return updated topic
2. Handle edge cases:
   - Not mod/admin → 403
   - Topic not found → 404
3. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] PATCH /topics/:id/pin pins the topic
- [ ] Only mod/admin can pin
- [ ] Returns updated topic
