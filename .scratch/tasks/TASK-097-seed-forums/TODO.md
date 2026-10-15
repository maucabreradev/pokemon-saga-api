# TASK-097: Create seeder for initial forums

## Objective
Seed the database with initial forums within categories.

## Steps

1. Extend src/database/seed/seed.ts
2. Create seed data for forums:
   - Under "Pokémon Lore":
     - "Kanto Region"
     - "Johto Region"
     - "Hoenn Region"
   - Under "Roleplay":
     - "Beginner Roleplay"
     - "Advanced Roleplay"
   - Under "Battles":
     - "Battle Strategies"
     - "Tournament Announcements"
   - Under "Off-Topic":
     - "General Chat"
     - "Introductions"
3. Each forum has: name, description, visibility, display_order
4. Support nested forums (sub-forums)
5. Make seeder idempotent
6. Test: run seeder, verify forums in DB with correct hierarchy


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Seeder creates initial forums
- [ ] Forums correctly associated with categories
- [ ] Nested forums (sub-forums) supported
- [ ] Idempotent (safe to run multiple times)
- [ ] Seeded data verified in database
