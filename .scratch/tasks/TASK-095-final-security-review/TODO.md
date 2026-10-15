# TASK-095: Final security review and hardening

## Objective
Comprehensive security review before considering the API production-ready.

## Steps

1. **Authentication review**:
   - JWT secret is strong and from env var
   - Refresh tokens properly hashed
   - Token expiry is appropriate
   - Brute force protection on login
2. **Authorization review**:
   - All protected endpoints have guards
   - Ownership checks in place
   - Role hierarchy enforced
   - No IDOR vulnerabilities
3. **Input validation**:
   - All DTOs validated
   - No SQL injection vectors
   - XSS prevention (DOMPurify) working
   - File upload validation (if applicable)
4. **Rate limiting**:
   - Auth endpoints strictly limited
   - General endpoints reasonably limited
   - Per-user limits where appropriate
5. **Headers**:
   - Helmet configured correctly
   - CORS properly restricted
   - No sensitive headers exposed
6. **Error handling**:
   - No stack traces leaked
   - No sensitive data in error messages
7. **Dependency audit**:
   - Run pnpm audit
   - Update vulnerable dependencies
8. **Environment variables**:
   - .env.example complete
   - No hardcoded secrets
   - Production secrets different from dev


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] All authentication checks pass
- [ ] All authorization checks pass
- [ ] Input validation comprehensive
- [ ] Rate limiting effective
- [ ] Security headers present
- [ ] No sensitive data leaked
- [ ] No known vulnerabilities in dependencies
- [ ] Documentation complete
