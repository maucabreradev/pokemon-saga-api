# TASK-078: Add request validation pipes globally

## Objective
Ensure all incoming requests are validated.

## Steps

1. Install class-validator, class-transformer
2. Create global ValidationPipe in main.ts:
   - whitelist: true (strip unknown properties)
   - forbidNonWhitelisted: true (reject unknown properties)
   - transform: true (auto-transform types)
3. Create custom validation decorators if needed
4. Apply DTOs to all endpoints
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
