# TASK-081: Stabilize Jest test environment for Phase 9 pyramid

## Objective
Base Jest setup already landed via FIX-002/003 (configs, babel ESM transform, swagger stub). This task verifies the environment is ready for the Phase 9 pyramid (TASK-082-089) and closes the test-DB isolation gap.

## Current State
- `jest.config.js`, `tests/jest-e2e.json`, `tests/jest-integration.json` exist.
- `pnpm test` runs colocated unit specs; `pnpm test:e2e` boots real AppModule.
- `pnpm test:integration` is vacuous until Phase 9; no isolated test database yet.

## Steps

1. Verify installed jest, ts-jest, @types/jest, supertest, @types/supertest versions (no reinstall unless missing)
2. Verify existing configs:
   - jest unit (src/**/*.spec.ts)
   - jest integration (tests/integration)
   - jest e2e (tests/e2e) with babel CommonJS transform + swagger stub
3. Verify test scripts in package.json:
   - test, test:integration, test:e2e, test:cov, test:watch
5. Create tests/setup.ts for global test setup
6. Create tests/teardown.ts for cleanup
7. Verify all test commands work


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] `pnpm test` runs unit tests
- [ ] `pnpm test:integration` runs integration tests
- [ ] `pnpm test:e2e` runs e2e tests
- [ ] `pnpm test:cov` generates coverage report
- [ ] Test environment isolated from dev/prod database
