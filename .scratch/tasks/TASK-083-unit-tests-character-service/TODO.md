# TASK-083: Write unit tests for character service

## Objective
Comprehensive unit tests for the character service.

## Steps

1. Create tests/unit/characters/characters.service.spec.ts
2. Test character creation:
   - Successfully creates character
   - Enforces max 3 characters per user
   - Generates readable ID
   - Sets first character as main
3. Test readable ID generation:
   - Generates unique IDs
   - Handles collisions with retry
   - Validates custom ID format
4. Test character deletion:
   - Soft deletes correctly
   - Preserves content
5. Test character status changes:
   - Ban sets status and timestamp
   - Unban restores status
6. Mock database layer


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] All character service methods tested
- [ ] Max 3 enforcement tested
- [ ] Readable ID generation tested
- [ ] Coverage > 80% on character service
- [ ] All tests pass
