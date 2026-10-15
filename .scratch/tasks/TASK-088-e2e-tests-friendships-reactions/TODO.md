# TASK-088: Write e2e tests for friendships and reactions

## Objective
Full end-to-end testing of social features.

## Steps

1. Create tests/e2e/friendships/friendships.e2e-spec.ts
2. Create tests/e2e/reactions/reactions.e2e-spec.ts
3. Setup: Create two users with characters
4. Test friendship lifecycle:
   - Send friend request
   - Accept friend request
   - Reject friend request
   - Remove friend
   - Block character
5. Test reaction lifecycle:
   - Add reaction to topic
   - Add reaction to post
   - Remove reaction
   - Duplicate reaction handling
6. Test restrictions:
   - Cannot friend yourself
   - Cannot react to deleted content
   - Blocked characters cannot interact
7. Truncate tables between tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Full friendship lifecycle tested
- [ ] Full reaction lifecycle tested
- [ ] Edge cases covered (self-friend, duplicates, blocks)
- [ ] All tests pass
