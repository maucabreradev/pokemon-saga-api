# TASK-041: Implement POST /forums/categories (admin)

## Objective
Allow admins to create new forum categories.

## Steps

1. Create create-category.dto.ts:
   - name (required, 3-64 chars)
   - description (optional, max 200 chars)
   - visibility (enum: public, registered, characters_only)
2. Implement POST /api/v1/forums/categories:
   - Require authentication + admin role
   - Create category with display_order = max + 1
   - Return created category
3. Handle edge cases:
   - Non-admin → 403 Forbidden
4. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] POST /forums/categories creates new category
- [ ] Only admin can create categories
- [ ] Returns 201 Created with category data
- [ ] Non-admin gets 403 Forbidden
