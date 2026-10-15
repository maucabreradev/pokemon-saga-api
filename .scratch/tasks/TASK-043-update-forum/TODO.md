# TASK-043: Implement PATCH /forums/:id (admin)

## Objective
Allow admins to update forum details.

## Steps

1. Create update-forum.dto.ts:
   - name (optional)
   - description (optional)
2. Implement PATCH /api/v1/forums/:id:
   - Require authentication + admin role
   - Update allowed fields only
   - Return updated forum
3. Handle edge cases:
   - Non-admin → 403
   - Forum not found → 404
4. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] PATCH /forums/:id updates forum details
- [ ] Only admin can update
- [ ] Partial updates supported
- [ ] Returns updated forum
