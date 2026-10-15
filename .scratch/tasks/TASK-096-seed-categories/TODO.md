# TASK-096: Create seeder for initial categories

## Objective
Seed the database with initial forum categories.

## Steps

1. Create src/database/seed/seed.ts
2. Create seed data for categories:
   - "Pokémon Lore" — discussions about Pokémon universe
   - "Roleplay" — role-playing forums
   - "Battles" — battle strategies and competitions
   - "Trading" — trading Pokémon/items
   - "Off-Topic" — general discussion
3. Each category has:
   - name, description, display_order, visibility = 'public'
4. Use Drizzle insert with ON CONFLICT DO NOTHING
5. Make seeder idempotent (safe to run multiple times)
6. Add npm script: db:seed
7. Test: run seeder, verify categories in DB


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Seeder creates initial categories
- [ ] Idempotent (safe to run multiple times)
- [ ] Categories have correct visibility
- [ ] `pnpm db:seed` works
- [ ] Seeded data verified in database
