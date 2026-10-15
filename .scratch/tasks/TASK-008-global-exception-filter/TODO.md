# TASK-008: Implement global exception filter and error handling

## Objective
Create a standardized error response format for all API errors.

## Steps

1. Create src/common/filters/:
   - http-exception-filter.ts — catches all HTTP exceptions
   - database-exception-filter.ts — catches DB errors (unique violations, FK violations)
   - all-exceptions-filter.ts — catches any unhandled errors
2. Create standardized error response interface:
   ```typescript
   {
     statusCode: number;
     message: string | string[];
     error: string;
     timestamp: string;
     path: string;
   }
   ```
3. Register filters globally in main.ts
4. Create custom exception classes:
   - NotFoundException (already exists, extend as needed)
   - ConflictException for duplicate resources
   - ForbiddenException for ownership/permission issues
5. Log errors with appropriate severity levels
6. Verify error responses for common scenarios:
   - 400 Bad Request (validation)
   - 401 Unauthorized
   - 403 Forbidden
   - 404 Not Found
   - 409 Conflict
   - 500 Internal Server Error


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] All errors return standardized JSON format
- [ ] Database unique violations return 409 Conflict
- [ ] Database FK violations return 400 Bad Request
- [ ] Unhandled errors return 500 without leaking internals
- [ ] Error responses include timestamp and request path
- [ ] Errors are logged to console (development) or external service (production)
