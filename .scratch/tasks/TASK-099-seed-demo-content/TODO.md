# TASK-099: Create seeder for demo characters and content

## Objective
Seed demo characters, topics, and posts for testing/development.

## Steps

1. Extend src/database/seed/seed.ts
2. Create demo users (5-10):
   - Various emails like user1@example.com, user2@example.com
   - Each with 1-3 characters
   - Varied readable IDs
3. Create demo content:
   - 2-3 demo topics per forum
   - 5-10 replies per topic
   - Some reactions on topics and posts
   - Some friendships between demo characters
4. Use faker library for realistic content
5. Make seeder idempotent
6. Test: run seeder, verify demo content in DB


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Seeder creates demo users with characters
- [ ] Demo topics and posts created
- [ ] Demo reactions and friendships created
- [ ] Content is realistic (using faker)
- [ ] Idempotent (safe to run multiple times)
- [ ] Demo data verified in database
