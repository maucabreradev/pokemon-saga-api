# TASK-029: Implement character creation (max 3 per user)

## Objective
Allow authenticated users to create up to 3 characters.

## Steps

1. Create characters.module.ts, characters.controller.ts, characters.service.ts
2. Create create-character.dto.ts:
   - public_name (required, 3-32 chars)
   - bio (optional, max 500 chars)
3. Implement POST /api/v1/characters:
   - Require authentication
   - Check user has fewer than 3 active characters
   - Generate readable_id (see TASK-030)
   - Create character with status = 'active'
   - Create associated characters_profile
   - If first character, set is_main_character = true
   - Return created character
4. Handle edge cases:
   - Already has 3 characters → 403 or 409
   - Duplicate readable_id → retry generation (max 5 attempts)
5. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] POST /characters creates a new character
- [ ] User cannot exceed 3 active characters
- [ ] First character automatically set as main
- [ ] Readable ID is auto-generated
- [ ] Returns 201 Created with character data
- [ ] Requires authentication
