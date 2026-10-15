# TASK-034: Implement POST /characters/:readableId/set-main

## Objective
Allow users to switch their main character.

## Steps

1. Implement POST /api/v1/characters/:readableId/set-main:
   - Require authentication
   - Verify character ownership
   - Set is_main_character = false for all user's characters
   - Set is_main_character = true for target character
   - Return updated character
2. Handle edge cases:
   - Not owner → 403 Forbidden
   - Character not found → 404
3. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] POST set-main changes the main character
- [ ] Only one main character per user at a time
- [ ] Only owner can change main character
- [ ] Returns updated character
