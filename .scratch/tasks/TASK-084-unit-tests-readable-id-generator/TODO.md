# TASK-084: Write unit tests for readable ID generator

## Objective
Test the human-readable ID generation logic.

## Steps

1. Create tests/unit/utils/readable-id-generator.spec.ts
2. Test ID format:
   - Matches pattern: CapitalizedWords + Number
   - No spaces or special characters
   - Minimum and maximum length
3. Test uniqueness:
   - Generates different IDs on multiple calls
   - Retries on collision
   - Throws after max retries
4. Test custom ID validation:
   - Accepts valid IDs
   - Rejects too short/long IDs
   - Rejects special characters
   - Rejects IDs starting with number
5. Mock database for collision testing


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] ID format matches specification
- [ ] Collision handling tested
- [ ] Custom ID validation tested
- [ ] Edge cases covered (max retries, invalid formats)
- [ ] All tests pass
