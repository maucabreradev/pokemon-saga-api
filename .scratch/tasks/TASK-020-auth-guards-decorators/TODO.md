# TASK-020: Create AuthGuard and @CurrentUser decorator

## Objective
Build reusable authentication guards and decorators.

## Steps

1. Create src/common/guards/:
   - jwt-auth.guard.ts — uses passport JWT strategy
2. Create src/common/decorators/:
   - current-user.decorator.ts — extracts user from request
   - current-character.decorator.ts — extracts active character from request
   - public.decorator.ts — marks endpoints as public (skip auth)
3. Create PublicAuthGuard that respects @Public() decorator
4. Apply global auth guard in app.module.ts (except @Public() routes)
5. Test guard behavior:
   - No token → 401
   - Invalid token → 401
   - Valid token → request proceeds with user attached


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Global auth guard active on all routes by default
- [ ] @Public() decorator bypasses auth for specific endpoints
- [ ] @CurrentUser() returns the authenticated user
- [ ] Invalid/missing tokens return 401
- [ ] User object attached to request for downstream use
