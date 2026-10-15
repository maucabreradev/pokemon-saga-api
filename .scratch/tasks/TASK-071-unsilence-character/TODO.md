# TASK-071: Implement POST /moderation/unsilence

## Objective
Allow mods/admins to remove a silence before it expires.

## Steps

1. Create unsilence.dto.ts — character_id (UUID)
2. Implement POST /api/v1/moderation/unsilence:
   - Require authentication + mod/admin role
   - Verify character exists and is silenced
   - Remove silence record (or set expires_at to NOW())
   - Create moderation_log entry
   - Return confirmation
3. Handle edge cases:
   - Not mod/admin → 403
   - Character not silenced → 400
4. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] POST /moderation/unsilence removes the silence
- [ ] Only mod/admin can unsilence
- [ ] Character can interact immediately after unsilence
