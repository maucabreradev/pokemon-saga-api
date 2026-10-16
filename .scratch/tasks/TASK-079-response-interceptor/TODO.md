# TASK-079: Audit response transformation interceptor

## Objective
Decide response envelope before hardening. Existing `src/common/interceptors/response.interceptor.ts` (TASK-008) adds metadata (timestamp, path, duration) — it does NOT wrap in `{ data, meta }`. Adopting the envelope below is a breaking change and needs an ADR.

## Current State
Interceptor exists and is registered globally. Do not recreate it until the envelope decision is recorded.

## Steps

1. Verify existing interceptor file and global registration
2. ADR decision required: keep metadata envelope vs migrate to standard format:
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
