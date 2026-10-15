# TASK-068: Implement POST /moderation/ban

## Objective
Allow mods/admins to ban a character.

## Steps

1. Create moderation.module.ts, moderation.controller.ts, moderation.service.ts
2. Create ban.dto.ts:
   - character_id (UUID)
   - reason (required, max 500 chars)
3. Implement POST /api/v1/moderation/ban:
   - Require authentication + mod/admin role
   - Verify target character exists
   - Set character status = 'banned', deleted_at = NOW()
   - Revoke all user's refresh tokens
   - Create moderation_log entry
   - Return ban confirmation
4. Handle edge cases:
   - Not mod/admin → 403
   - Character not found → 404
   - Already banned → idempotent
5. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] POST /moderation/ban bans the character
- [ ] Only mod/admin can ban
- [ ] Banned character cannot login
- [ ] Moderation log entry created
- [ ] Reason is required
