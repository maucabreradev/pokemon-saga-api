# TASK-082: Write unit tests for auth service

## Objective
Comprehensive unit tests for the authentication service.

## Steps

1. Create tests/unit/auth/auth.service.spec.ts
2. Test registration:
   - Successfully creates user
   - Rejects duplicate email
   - Hashes password correctly
3. Test login:
   - Returns tokens for valid credentials
   - Rejects invalid password
   - Rejects non-existent email
4. Test refresh:
   - Returns new token pair
   - Revokes old refresh token
   - Rejects expired token
   - Rejects revoked token
5. Test logout:
   - Revokes single token
   - Revokes all tokens
6. Mock database layer


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] All auth service methods tested
- [ ] Edge cases covered (expired tokens, revoked tokens, etc.)
- [ ] Coverage > 80% on auth service
- [ ] Tests run in isolation (no DB dependency)
- [ ] All tests pass
