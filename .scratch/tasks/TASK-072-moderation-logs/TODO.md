# TASK-072: Implement GET /moderation/logs

## Objective
Allow mods/admins to view moderation action logs.

## Steps

1. Implement GET /api/v1/moderation/logs:
   - Require authentication + mod/admin role
   - Query moderation_logs ordered by created_at DESC
   - Support filters: moderator_id, target_id, action, date range
   - Support pagination
   - Return: id, moderator info, action, target info, reason, created_at
2. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] GET /moderation/logs returns paginated logs
- [ ] Filterable by moderator, target, action, date
- [ ] Only mod/admin can view
- [ ] Ordered by created_at DESC
