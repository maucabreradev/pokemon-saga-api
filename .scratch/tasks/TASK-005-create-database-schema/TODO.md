# TASK-005: Create database schema (all tables)

## Objective
Define the complete Drizzle schema for all entities.

## Steps

1. Create src/database/schema/ directory structure:
   - users.ts — users table
   - characters.ts — characters table
   - characters-profile.ts — characters_profile table
   - refresh-tokens.ts — refresh_tokens table
   - categories.ts — categories table
   - forums.ts — forums table (self-referencing)
   - topics.ts — topics table
   - posts.ts — posts table (self-referencing)
   - friendships.ts — friendships table (self-referencing)
   - reactions.ts — reactions table
   - moderation-logs.ts — moderation_logs table
   - silences.ts — silences table
   - index.ts — exports all schemas
2. Define enums:
   - user_role: user, admin, webmaster
   - character_status: active, banned, deleted
   - forum_visibility: public, registered, characters_only
   - friendship_status: pending, accepted, blocked
   - moderation_action: ban, unban, delete, silence, unsilence
   - reaction_type: like, love, laugh, etc.
3. Add all indexes as defined in DB.md
4. Add foreign key constraints with appropriate ON DELETE actions
5. Export schema from index


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] All 12 tables defined with correct columns and types
- [ ] All enums created with correct values
- [ ] All foreign keys with proper ON DELETE/UPDATE actions
- [ ] All indexes defined
- [ ] Schema compiles without TypeScript errors
