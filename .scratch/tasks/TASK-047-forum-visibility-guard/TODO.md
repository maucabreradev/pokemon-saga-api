# TASK-047: Implement forum visibility guard (public/registered/characters_only)

## Objective
Enforce forum visibility rules on topic/post access.

## Steps

1. Create forum-visibility.guard.ts:
   - Check if forum is visible to current requester
   - public → anyone can view
   - registered → any authenticated user
   - characters_only → only users with at least one active character
2. Apply guard to topic and post endpoints
3. Return 403 Forbidden if not authorized
4. Return 404 if forum doesn't exist (don't leak)
5. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Public forums accessible to everyone
- [ ] Registered-only forums require authentication
- [ ] Characters-only forums require active character
- [ ] Inaccessible forums return 403 or 404
- [ ] Guard applied to topic and post endpoints
