# TASK-014: Implement user registration endpoint

## Objective
Allow new users to register with email and password.

## Steps

1. Install bcrypt, @nestjs/jwt, @nestjs/passport, passport, passport-jwt
2. Create src/modules/auth/:
   - auth.module.ts
   - auth.controller.ts
   - auth.service.ts
3. Create DTOs:
   - register.dto.ts — email (valid format), password (min 8, max 64, complexity)
4. Implement POST /api/v1/auth/register:
   - Validate input
   - Check email uniqueness
   - Hash password with bcrypt (12 rounds)
   - Create user in DB
   - Return user profile (no sensitive data)
5. Add Swagger decorators
6. Add unit tests for auth service


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] POST /api/v1/auth/register creates new user
- [ ] Duplicate email returns 409 Conflict
- [ ] Invalid email format returns 400 Bad Request
- [ ] Weak password returns 400 with clear message
- [ ] Password is hashed (not stored in plain text)
- [ ] Response does not include password hash
- [ ] Rate limited to 5 req/min per IP
