# TASK-087: Write e2e tests for topics and posts

## Objective
Full end-to-end testing of topic and post functionality.

## Steps

1. Create tests/e2e/topics/topics.e2e-spec.ts
2. Create tests/e2e/posts/posts.e2e-spec.ts
3. Setup: Create user, character, forum, get auth token
4. Test topic lifecycle:
   - Create topic
   - List topics
   - Get topic detail
   - Edit topic
   - Delete topic
   - Pin/lock (as mod)
5. Test post lifecycle:
   - Create post
   - Reply to post (nested)
   - Edit post
   - Delete post
6. Test visibility:
   - Forum visibility restrictions
   - Deleted content hidden
7. Test sanitization:
   - XSS attempts stripped
   - Safe HTML preserved
8. Truncate tables between tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Full topic CRUD tested
- [ ] Full post CRUD tested
- [ ] Nested replies tested
- [ ] Visibility restrictions tested
- [ ] XSS sanitization verified
- [ ] All tests pass
