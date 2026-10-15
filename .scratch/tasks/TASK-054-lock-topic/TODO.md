# TASK-054: Implement PATCH /topics/:id/lock (mod/admin)

## Objective
Allow mods/admins to lock a topic (prevent new replies).

## Steps

1. Implement PATCH /api/v1/topics/:id/lock:
   - Require authentication + mod/admin role
   - Set is_locked = true
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
- [ ] PATCH /topics/:id/lock locks the topic
- [ ] Only mod/admin can lock
- [ ] Locked topic prevents new posts
- [ ] Returns updated topic
