# TASK-016: Implement refresh token generation and storage

## Objective
Generate and store hashed refresh tokens for each login.

## Steps

1. Create refresh token service:
   - Generate cryptographically random token (64 bytes hex)
   - Hash token with SHA-256 before storing in DB
   - Set expiry to 30 days from now
   - Store: user_id, token_hash, expires_at
2. Modify login endpoint to also return refresh token
3. Modify registration to optionally auto-login (return tokens)
4. Create token cleanup service (delete expired tokens on login)
5. Add index on refresh_tokens.user_id for fast lookup
6. Unit tests for token generation


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Login returns both access_token and refresh_token
- [ ] Refresh token stored as hash (not plain text)
- [ ] Refresh token expires after 30 days
- [ ] Expired tokens are cleaned up on new login
- [ ] Each login creates a new refresh token record
