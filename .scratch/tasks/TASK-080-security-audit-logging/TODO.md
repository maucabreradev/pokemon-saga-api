# TASK-080: Add security audit logging

## Objective
Log security-relevant events for auditing.

## Steps

1. Create src/common/services/audit-logger.service.ts
2. Log events:
   - User registration
   - Login success/failure
   - Password change
   - Token refresh
   - Role changes
   - Moderation actions (ban, unban, silence)
   - Permission denied attempts
3. Each log entry includes:
   - timestamp
   - user_id (if available)
   - ip_address
   - user_agent
   - action
   - result (success/failure)
   - details
4. Store logs in database or external logging service
5. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] All security events logged
- [ ] Logs include IP and user agent
- [ ] Failed login attempts logged
- [ ] Moderation actions logged with moderator info
- [ ] Logs are queryable for audit purposes
