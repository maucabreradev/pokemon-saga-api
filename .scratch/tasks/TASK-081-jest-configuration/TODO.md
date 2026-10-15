# TASK-081: Set up Jest configuration and test environment

## Objective
Configure Jest for unit, integration, and e2e testing.

## Steps

1. Install jest, ts-jest, @types/jest, supertest, @types/supertest
2. Create jest.config.js:
   - preset: ts-jest
   - testEnvironment: node
   - coverageDirectory: coverage
   - collectCoverageFrom: src/**/*.ts
3. Create separate configs:
   - jest.unit.config.js — unit tests (src/**/*.spec.ts)
   - jest.integration.config.js — integration tests (tests/integration/*.spec.ts)
   - jest.e2e.config.js — e2e tests (tests/e2e/*.spec.ts)
4. Add test scripts to package.json:
   - test, test:unit, test:integration, test:e2e, test:cov, test:watch
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
