# TASK-075: Implement banned character access restriction

## Objective
Prevent banned characters from accessing the forum.

## Steps

1. Add check in auth guard or JWT strategy:
   - After loading user, check all characters
   - If ALL characters are banned/deleted, reject login
2. Add check in character context middleware:
   - Verify active character is not banned
   - Return 403 if banned
3. Banned character cannot:
   - Create topics/posts
   - React
   - Send friend requests
   - Login
4. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Banned character cannot login
- [ ] Banned character cannot interact in forum
- [ ] All characters banned → user cannot login
- [ ] Unban restores access immediately
