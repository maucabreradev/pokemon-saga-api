# TASK-042: Implement POST /forums (admin)

## Objective
Allow admins to create new forums (optionally nested).

## Steps

1. Create create-forum.dto.ts:
   - category_id (required, valid UUID)
   - parent_forum_id (optional, valid UUID)
   - name (required, 3-64 chars)
   - description (optional, max 200 chars)
   - visibility (enum: public, registered, characters_only)
2. Implement POST /api/v1/forums:
   - Require authentication + admin role
   - Validate category exists
   - If parent_forum_id provided, validate it exists and belongs to same category
   - Create forum
   - Return created forum
3. Handle edge cases:
   - Non-admin → 403
   - Invalid category → 400
   - Invalid parent → 400
4. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] POST /forums creates new forum
- [ ] Supports nesting via parent_forum_id
- [ ] Only admin can create forums
- [ ] Returns 201 Created with forum data
