# TASK-092: Optimize database queries (N+1 prevention)

## Objective
Identify and fix N+1 query problems and optimize slow queries.

## Steps

1. Enable Drizzle query logging in development
2. Review all list endpoints for N+1 patterns:
   - GET /topics — should join forums and characters in single query
   - GET /posts — should join characters
   - GET /forums — tree building should be efficient
   - GET /characters/:id/friends — should join characters
3. Use Drizzle relational queries or JOINs instead of separate queries
4. Add database indexes where missing (review slow query log)
5. Consider caching for frequently accessed, rarely changed data:
   - Forum tree structure
   - Category list
6. Test query performance:
   - Measure query count per request
   - Measure response time
7. Document query patterns used


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] No N+1 queries in list endpoints
- [ ] All list endpoints use JOINs instead of separate queries
- [ ] Response times < 200ms for list endpoints (with reasonable data volume)
- [ ] Appropriate indexes added
- [ ] All tests still pass
