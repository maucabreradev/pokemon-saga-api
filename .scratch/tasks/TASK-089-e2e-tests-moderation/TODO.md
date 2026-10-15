# TASK-089: Write e2e tests for moderation actions

## Objective
Full end-to-end testing of moderation functionality.

## Steps

1. Create tests/e2e/moderation/moderation.e2e-spec.ts
2. Setup: Create admin user, mod user, regular characters
3. Test ban flow:
   - Mod bans character
   - Banned character cannot login
   - Banned character cannot create content
   - Mod unbans character
4. Test silence flow:
   - Mod silences character
   - Silenced character cannot create content
   - Silence expires automatically
   - Mod unsilences character
5. Test permission restrictions:
   - Non-mod cannot ban
   - Non-mod cannot silence
   - Non-mod cannot pin/lock topics
6. Test moderation logs:
   - Actions are logged
   - Logs are viewable by mod/admin
7. Truncate tables between tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Ban/unban flow tested
- [ ] Silence/unsilence flow tested
- [ ] Permission restrictions verified
- [ ] Moderation logs tested
- [ ] All tests pass
