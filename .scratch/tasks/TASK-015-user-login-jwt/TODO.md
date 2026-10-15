# TASK-015: Implement user login with JWT access token

## Objective
Authenticate users and return JWT access token.

## Steps

1. Create login.dto.ts — email, password
2. Implement POST /api/v1/auth/login:
   - Validate credentials
   - Find user by email
   - Verify password with bcrypt
   - Check user is not deleted
   - Generate JWT access token (15 min expiry)
   - Return token + user profile
3. Create JwtStrategy (passport-jwt):
   - Extract token from Authorization header
   - Verify token signature and expiry
   - Load user from DB
   - Attach user to request object
4. Create AuthGuard using passport JWT
5. Add Swagger auth decorator
6. Unit tests for login flow


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] POST /api/v1/auth/login returns access token for valid credentials
- [ ] Invalid credentials return 401 Unauthorized
- [ ] Non-existent email returns 401 (don't leak if email exists)
- [ ] Deleted user cannot login
- [ ] Token expires after 15 minutes
- [ ] Rate limited to 5 req/min per IP
