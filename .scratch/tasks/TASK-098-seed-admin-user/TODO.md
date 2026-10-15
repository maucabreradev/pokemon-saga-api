# TASK-098: Create seeder for admin user account

## Objective
Seed a default admin user for initial access.

## Steps

1. Extend src/database/seed/seed.ts
2. Create admin user:
   - email: admin@example.com (configurable via env)
   - password: AdminPassword123! (configurable via env)
   - role: admin
3. Hash password with bcrypt
4. Create admin character:
   - public_name: "Administrator"
   - readable_id: "AdminUser001"
   - status: active
   - is_main_character: true
5. Make seeder idempotent
6. Log admin credentials on seed (for development)
7. Test: run seeder, verify admin can login


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Seeder creates admin user
- [ ] Admin user has correct role
- [ ] Admin user has associated character
- [ ] Password properly hashed
- [ ] Admin can login with seeded credentials
- [ ] Idempotent (safe to run multiple times)
