# TASK-078: Audit global request validation pipes

## Objective
Verify the existing global ValidationPipe (landed in TASK-008) covers all endpoints including Phase 4-7 DTOs. No greenfield setup — this is a hardening audit.

## Current State
`src/common/pipes/validation.pipe.ts` is registered globally. Do not recreate it.

## Steps

1. Verify installed class-validator, class-transformer versions (no reinstall unless missing)
2. Verify global ValidationPipe options in main.ts:
   - whitelist: true (strip unknown properties)
   - forbidNonWhitelisted: true (reject unknown properties)
   - transform: true (auto-transform types)
3. Create custom validation decorators only if a gap is found
4. Apply DTOs to all endpoints added in Phase 4-7
5. Return 400 Bad Request with detailed validation errors:
   ```json
   {
     "statusCode": 400,
     "message": ["email must be an email", "password must be at least 8 characters"],
     "error": "Bad Request"
   }
   ```
6. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] All endpoints validate input DTOs
- [ ] Unknown properties rejected with 400
- [ ] Type transformation works (string → number for IDs)
- [ ] Detailed error messages returned
- [ ] Validation is consistent across all endpoints
