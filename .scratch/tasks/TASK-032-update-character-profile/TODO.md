# TASK-032: Implement PATCH /characters/:readableId (edit profile)

## Objective
Allow character owners to update their profile.

## Steps

1. Create update-character.dto.ts:
   - public_name (optional, 3-32 chars)
   - bio (optional, max 500 chars)
   - avatar_url (optional, valid URL)
   - custom_title (optional, max 64 chars)
   - signature (optional, max 200 chars)
2. Implement PATCH /api/v1/characters/:readableId:
   - Require authentication
   - Verify character ownership (user owns this character)
   - Update allowed fields only
   - Update characters_profile record
   - Return updated profile
3. Handle edge cases:
   - Not owner → 403 Forbidden
   - Character not found → 404
   - Character banned → 403
4. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] PATCH /characters/:readableId updates profile
- [ ] Only owner can update
- [ ] Non-owner gets 403 Forbidden
- [ ] Partial updates supported (only provided fields)
- [ ] Returns updated profile
