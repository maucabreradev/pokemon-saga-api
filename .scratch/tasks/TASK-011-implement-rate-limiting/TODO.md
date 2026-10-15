# TASK-011: Implement rate limiting with @nestjs/throttler

## Objective
Add rate limiting to prevent abuse and protect the API.

## Steps

1. Install @nestjs/throttler, @nestjs/throttler-storage-redis (optional for distributed)
2. Create src/config/throttler.config.ts:
   - General limit: 100 req/min per IP
   - Auth endpoints: 5 req/min per IP
   - Character creation: 3 req/hour per user
3. Register ThrottlerModule in app.module.ts
4. Create custom throttler guard if needed for per-user limits
5. Create decorators:
   - @Throttle() override for specific endpoints
   - @SkipThrottle() for public endpoints that shouldn't be limited
6. Add rate limit headers to responses:
   - X-RateLimit-Limit
   - X-RateLimit-Remaining
   - X-RateLimit-Reset
7. Return 429 Too Many Requests when limit exceeded


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Rate limiting active on all endpoints
- [ ] Auth endpoints have stricter limits (5/min)
- [ ] Exceeding limit returns 429 with Retry-After header
- [ ] Rate limit headers present in all responses
- [ ] Limits are configurable via environment variables
