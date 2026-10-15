# TASK-094: Write API usage examples in documentation

## Objective
Provide practical examples for common API workflows.

## Steps

1. Create docs/examples.md with:
   - User registration and login flow
   - Character creation and management
   - Creating a topic and posting replies
   - Managing friendships
   - Adding reactions
   - Moderation actions (ban, silence)
2. Include curl examples:
   ```bash
   # Register
   curl -X POST http://localhost:3000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"SecurePass123"}'
   ```
3. Include JavaScript/TypeScript examples:
   ```typescript
   const response = await fetch('http://localhost:3000/api/v1/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password }),
   });
   ```
4. Include Python examples (optional)
5. Link examples from README.md


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Common workflows documented with examples
- [ ] curl examples work as documented
- [ ] JavaScript/TypeScript examples work as documented
- [ ] Examples cover all major features
- [ ] Linked from README.md
