# TASK-100: Final integration test with seeded data

## Objective
Comprehensive final test using seeded data to verify the complete system.

## Steps

1. Create tests/e2e/full-system/full-system.e2e-spec.ts
2. Run full seed: pnpm db:seed
3. Test complete user journey:
   - Register new user
   - Login
   - Create character
   - Create topic in forum
   - Post reply
   - React to topic
   - Add friend
   - Moderator bans a character
   - Admin changes forum visibility
4. Verify all relationships work:
   - User → Characters → Topics → Posts → Reactions
   - Friendships between characters
   - Moderation actions and logs
5. Performance check:
   - Measure response times for key endpoints
   - Verify no N+1 queries
6. Security check:
   - Verify all guards work
   - Verify rate limiting works
7. Document any issues found
8. Final cleanup: truncate and re-seed


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Complete user journey tested end-to-end
- [ ] All entity relationships verified
- [ ] Moderation workflow tested
- [ ] Admin workflow tested
- [ ] Performance benchmarks recorded
- [ ] Security checks passed
- [ ] No critical issues found
- [ ] All tests pass
