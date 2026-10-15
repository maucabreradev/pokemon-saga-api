# TASK-076: Add absent user status logic

## Objective
Implement the "absent" status for users.

## Steps

1. Add is_absent column to users table (if not already in schema)
2. Create endpoint: POST /users/me/absent (mark as absent)
3. Create endpoint: POST /users/me/active (mark as active)
4. Absent users:
   - Can still login and view content
   - Cannot create new topics/posts (or can, depending on requirements)
   - Show "Absent" badge on profile
5. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] User can mark themselves as absent
- [ ] User can return from absent status
- [ ] Absent status visible on profile
- [ ] Absent users have restricted permissions (if applicable)
