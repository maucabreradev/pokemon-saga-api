# TASK-040: Implement GET /forums/:id (forum detail)

## Objective
Return details of a specific forum including its sub-forums.

## Steps

1. Implement GET /api/v1/forums/:id:
   - Public endpoint
   - Return forum details: id, name, description, visibility, display_order
   - Include sub-forums (immediate children only)
   - Include parent forum breadcrumb trail
   - Include topic count
2. Handle edge cases:
   - Forum not found → 404
   - Forum not visible to requester → 404 (don't leak)
3. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] GET /forums/:id returns forum details
- [ ] Includes sub-forums list
- [ ] Includes breadcrumb trail (parent hierarchy)
- [ ] Non-existent or inaccessible forum returns 404
