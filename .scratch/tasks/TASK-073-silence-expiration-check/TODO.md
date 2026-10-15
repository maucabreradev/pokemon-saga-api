# TASK-073: Implement silence expiration check on auth

## Objective
Prevent silenced characters from creating content.

## Steps

1. Create silence.service.ts:
   - Method: isCharacterSilenced(character_id): boolean
   - Check active silence records where expires_at > NOW()
2. Apply check in:
   - POST /topics — return 403 if silenced
   - POST /posts — return 403 if silenced
   - POST /reactions — return 403 if silenced
3. Include silence expiry in error response:
   ```json
   {
     "message": "You are silenced until 2024-01-15T12:00:00Z"
   }
   ```
4. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Silenced characters cannot create topics
- [ ] Silenced characters cannot create posts
- [ ] Silenced characters cannot react
- [ ] Error message includes silence expiry time
- [ ] Expired silences automatically lift
