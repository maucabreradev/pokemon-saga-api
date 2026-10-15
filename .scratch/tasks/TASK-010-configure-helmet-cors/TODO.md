# TASK-010: Configure Helmet, CORS, and security headers

## Objective
Add security headers and CORS configuration.

## Steps

1. Install helmet
2. Configure Helmet in main.ts:
   - Content Security Policy
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - Strict-Transport-Security
   - X-DNS-Prefetch-Control
   - Referrer-Policy
3. Configure CORS:
   - Origin whitelist from env var (CORS_ORIGIN)
   - Allow credentials (for cookies if needed later)
   - Allowed methods: GET, POST, PATCH, DELETE
   - Allowed headers: Content-Type, Authorization
4. Verify security headers are present in responses


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] All Helmet security headers present in HTTP responses
- [ ] CORS allows requests from configured origins
- [ ] CORS blocks requests from non-whitelisted origins
- [ ] Preflight OPTIONS requests handled correctly
