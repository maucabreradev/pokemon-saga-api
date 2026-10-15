# TASK-091: Review and improve error messages

## Objective
Ensure all error messages are clear, actionable, and user-friendly.

## Steps

1. Review all existing error messages
2. Standardize error message format:
   - Clear, concise language
   - Actionable (tell user what to do)
   - No internal details leaked (stack traces, SQL errors)
3. Common error messages:
   - 400: "Invalid input. Please check your data and try again."
   - 401: "Authentication required. Please log in."
   - 403: "You don't have permission to perform this action."
   - 404: "The requested resource was not found."
   - 409: "This resource already exists or conflicts with existing data."
   - 429: "Too many requests. Please try again later."
   - 500: "An unexpected error occurred. Please try again later."
4. Add specific messages for common scenarios:
   - "Email is already registered"
   - "Maximum 3 characters allowed per account"
   - "You can only change your readable ID once"
5. Verify no sensitive data in error responses


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] All error messages are clear and user-friendly
- [ ] No internal details leaked in production
- [ ] Consistent message format across all endpoints
- [ ] Specific messages for common error scenarios
- [ ] All tests still pass
