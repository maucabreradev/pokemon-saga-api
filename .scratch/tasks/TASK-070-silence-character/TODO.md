# TASK-070: Implement POST /moderation/silence (temporary)

## Objective
Allow mods/admins to temporarily silence a character.

## Steps

1. Create silence.dto.ts:
   - character_id (UUID)
   - reason (required)
   - duration_minutes (required, 1-10080)
2. Implement POST /api/v1/moderation/silence:
   - Require authentication + mod/admin role
   - Verify character exists
   - Create silence record with expires_at
   - Create moderation_log entry
   - Return silence confirmation
3. Handle edge cases:
   - Not mod/admin → 403
   - Character not found → 404
4. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] POST /moderation/silence silences the character
- [ ] Silenced character cannot create topics/posts
- [ ] Expiry is enforced automatically
- [ ] Moderation log entry created
