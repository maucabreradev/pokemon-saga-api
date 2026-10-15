# TASK-069: Implement POST /moderation/unban

## Objective
Allow mods/admins to unban a character.

## Steps

1. Create unban.dto.ts — character_id (UUID)
2. Implement POST /api/v1/moderation/unban:
   - Require authentication + mod/admin role
   - Verify character exists and is banned
   - Set character status = 'active', deleted_at = NULL
   - Create moderation_log entry
   - Return unban confirmation
3. Handle edge cases:
   - Not mod/admin → 403
   - Character not banned → 400
4. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] POST /moderation/unban unbans the character
- [ ] Only mod/admin can unban
- [ ] Unbanned character can login again
- [ ] Moderation log entry created
