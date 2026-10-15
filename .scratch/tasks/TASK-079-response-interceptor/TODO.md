# TASK-079: Implement response transformation interceptor

## Objective
Standardize all API responses.

## Steps

1. Create src/common/interceptors/response.interceptor.ts
2. Transform all responses to standard format:
   ```json
   {
     "data": { ... },
     "meta": { ... } // optional, for paginated responses
   }
   ```
3. Skip transformation for:
   - Error responses
   - File downloads
   - Health check endpoint
4. Register interceptor globally
5. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] All success responses wrapped in { data: ... } format
- [ ] Paginated responses include meta: { total, page, limit, totalPages }
- [ ] Error responses not transformed
- [ ] Response format is consistent across all endpoints
