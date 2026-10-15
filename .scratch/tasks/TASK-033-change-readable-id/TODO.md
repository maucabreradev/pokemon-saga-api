# TASK-033: Implement PATCH /characters/:readableId/readable-id (one-time rename)

## Objective
Allow users to change their character's readable ID exactly once.

## Steps

1. Create update-readable-id.dto.ts — readable_id (custom format)
2. Add column to characters table: `readable_id_changed` (boolean, default false)
3. Implement PATCH /api/v1/characters/:readableId/readable-id:
   - Require authentication
   - Verify character ownership
   - Check readable_id_changed = false (not already changed)
   - Validate new readable_id format (from TASK-030)
   - Check new readable_id is unique
   - Update readable_id and set readable_id_changed = true
   - Return updated character
4. Handle edge cases:
   - Already changed → 403 Forbidden
   - Duplicate readable_id → 409 Conflict
   - Invalid format → 400 Bad Request
5. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] PATCH readable-id changes the ID once
- [ ] Second attempt returns 403 Forbidden
- [ ] Duplicate ID returns 409 Conflict
- [ ] Invalid format returns 400
- [ ] Only owner can change
