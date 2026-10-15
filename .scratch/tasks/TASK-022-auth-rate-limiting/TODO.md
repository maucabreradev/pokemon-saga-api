# TASK-022: Add rate limiting to auth endpoints

## Objective
Apply stricter rate limits to authentication endpoints.

## Steps

1. Configure ThrottlerModule with custom rules for auth endpoints:
   - login: 5 req/min per IP
   - register: 3 req/min per IP
   - refresh: 10 req/min per IP
   - logout: 10 req/min per IP
2. Use @Throttle() decorator to override defaults on auth controller
3. Return 429 Too Many Requests when limit exceeded
4. Include Retry-After header in rate limit responses
5. Test rate limiting behavior


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Login limited to 5 requests/minute per IP
- [ ] Register limited to 3 requests/minute per IP
- [ ] Exceeding limits returns 429 with Retry-After header
- [ ] Rate limit resets after time window
