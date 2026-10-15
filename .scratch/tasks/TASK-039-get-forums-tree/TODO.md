# TASK-039: Implement GET /forums (full tree)

## Objective
Return the complete category/forum hierarchy as a nested tree.

## Steps

1. Create forums.module.ts, forums.controller.ts, forums.service.ts
2. Implement GET /api/v1/forums:
   - Public endpoint (respects visibility)
   - Query all categories ordered by display_order
   - For each category, query all forums (with unlimited nesting)
   - Build tree structure:
     ```json
     [
       {
         "id": "uuid",
         "name": "Category Name",
         "visibility": "public",
         "forums": [
           {
             "id": "uuid",
             "name": "Forum Name",
             "visibility": "public",
             "forums": [...]
           }
         ]
       }
     ]
     ```
   - Filter by visibility: show only forums the requester can see
3. Unit tests for tree building logic


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] GET /forums returns nested category/forum tree
- [ ] Forums ordered by display_order
- [ ] Visibility filtering works (public only for guests)
- [ ] Deeply nested forums handled correctly
- [ ] Response is cached for performance (optional)
