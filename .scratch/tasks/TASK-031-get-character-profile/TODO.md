# TASK-031: Implement GET /characters/:readableId (public profile)

## Objective
Return a character's public profile information.

## Steps

1. Implement GET /api/v1/characters/:readableId:
   - Public endpoint (no auth required)
   - Look up character by readable_id
   - Join with characters_profile
   - Return: readable_id, public_name, bio, avatar_url, custom_title, signature, created_at
   - Do NOT expose user_id or internal data
2. Handle edge cases:
   - Character not found → 404
   - Character deleted/banned → 404 (don't leak existence)
3. Add Swagger response decorator
4. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] GET /characters/:readableId returns public profile
- [ ] No authentication required
- [ ] Deleted/banned characters return 404
- [ ] Non-existent ID returns 404
- [ ] Sensitive fields (user_id) not exposed
