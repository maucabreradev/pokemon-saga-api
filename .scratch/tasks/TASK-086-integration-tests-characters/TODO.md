# TASK-086: Write integration tests for character endpoints

## Objective
Test character endpoints with real database interaction.

## Steps

1. Create tests/integration/characters/characters.e2e-spec.ts
2. Setup: Create test user, get auth token
3. Test character creation:
   - POST /api/v1/characters with valid data
   - Verify max 3 enforcement
   - Verify readable ID generation
4. Test character profile:
   - GET /api/v1/characters/:readableId
   - PATCH /api/v1/characters/:readableId
5. Test readable ID change:
   - PATCH /api/v1/characters/:readableId/readable-id
   - Verify one-time restriction
6. Test character deletion:
   - DELETE /api/v1/characters/:readableId
   - Verify soft delete
7. Truncate tables between tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] All character endpoints tested with real DB
- [ ] Max 3 enforcement verified
- [ ] Ownership verification tested
- [ ] One-time rename restriction tested
- [ ] All tests pass
