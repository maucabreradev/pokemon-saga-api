# TASK-050: Implement POST /topics (create topic)

## Objective
Allow characters to create new topics in forums.

## Steps

1. Create create-topic.dto.ts:
   - forum_id (required, valid UUID)
   - title (required, 3-128 chars)
   - body (required, max 50000 chars)
2. Implement POST /api/v1/topics:
   - Require authentication + active character
   - Verify forum exists and is visible
   - Verify forum is not locked
   - Sanitize body with DOMPurify
   - Create topic
   - Update forum topic_count
   - Return created topic
3. Handle edge cases:
   - No active character → 403
   - Forum locked → 403
   - Forum not visible → 403
4. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] POST /topics creates new topic
- [ ] Requires active character (not just user account)
- [ ] Body sanitized with DOMPurify
- [ ] Locked forums reject new topics
- [ ] Returns 201 Created with topic data
