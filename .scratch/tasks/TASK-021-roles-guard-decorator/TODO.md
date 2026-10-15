# TASK-021: Create @Roles() decorator and RolesGuard

## Objective
Implement role-based access control.

## Steps

1. Create src/common/decorators/:
   - roles.decorator.ts — @Roles('mod', 'admin', 'webmaster')
2. Create src/common/guards/:
   - roles.guard.ts — checks if user has required role
3. Role hierarchy:
   - webmaster > admin > mod > character > user
   - Higher roles inherit lower permissions
4. Apply RolesGuard globally (after AuthGuard)
5. Test role enforcement:
   - User with insufficient role → 403 Forbidden
   - User with required role → request proceeds
   - Multiple roles allowed (any match)


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] @Roles() decorator usable on controllers and handlers
- [ ] RolesGuard checks user role against required roles
- [ ] Role hierarchy works (webmaster can access admin routes)
- [ ] Missing role returns 403 Forbidden
- [ ] Multiple roles in @Roles() act as OR (any match)
