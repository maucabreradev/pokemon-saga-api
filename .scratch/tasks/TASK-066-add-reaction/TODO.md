# TASK-066: Implement POST /reactions (add reaction)

## Objective
Allow characters to react to topics or posts.

## Steps

1. Create reactions.module.ts, reactions.controller.ts, reactions.service.ts
2. Create create-reaction.dto.ts:
   - target_type (enum: topic, post)
   - target_id (UUID)
   - reaction_type (enum: like, love, laugh, etc.)
3. Implement POST /api/v1/reactions:
   - Require authentication + active character
   - Verify target exists and is not deleted
   - Check uniqueness (one reaction per type per character per target)
   - Create reaction
   - Return created reaction
4. Handle edge cases:
   - Duplicate reaction → 409 or idempotent 200
   - Target not found → 404
5. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] POST /reactions adds a reaction
- [ ] Duplicate reaction returns 409 or idempotent
- [ ] Target must exist and not be deleted
- [ ] Returns 201 Created with reaction data
