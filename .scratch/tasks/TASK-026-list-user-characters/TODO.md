# TASK-026: Implement GET /users/me/characters

## Objective
List all characters belonging to the authenticated user.

## Steps

1. Implement GET /api/v1/users/me/characters:
   - Require authentication
   - Query characters where user_id = ? AND status != 'deleted'
   - Return array of character summaries (id, readable_id, public_name, status, is_main_character)
   - Order by created_at ASC
2. Add Swagger response decorator
3. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] GET /users/me/characters returns all user's characters
- [ ] Deleted characters are excluded
- [ ] Empty array returned if user has no characters
- [ ] Requires authentication
