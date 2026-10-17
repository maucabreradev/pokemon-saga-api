# Testing Strategy

## TDD — Test-Driven Development (MANDATORY)

**Every feature and bugfix MUST follow TDD. No exceptions.**

The workflow for every task:

1. **RED** — Write a failing test first
   - Run it, verify it fails for the expected reason
2. **GREEN** — Write minimum code to pass
   - Run it, verify it passes
3. **REFACTOR** — Clean up while keeping tests green
   - Run full suite, verify no regressions

### Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

If code was written before the test: delete it, start over.

### Definition of Done

A task is not complete until:
- Tests were written before implementation
- Each test was verified to fail before implementing
- All tests pass
- No regressions in existing tests

## Overview

Testing is structured in three layers: unit tests, integration tests, and end-to-end (e2e) tests. All tests are written in English and follow the Arrange-Act-Assert pattern. TDD is mandatory for all new features and bugfixes.

## Test Layers

```
┌─────────────────────────────────────┐
│         E2E Tests                   │  ← Full request lifecycle
│    (supertest + test DB)            │
├─────────────────────────────────────┤
│      Integration Tests              │  ← Service + DB interaction
│    (test DB via URL)                │
├─────────────────────────────────────┤
│         Unit Tests                  │  ← Isolated functions/classes
│    (jest mocks)                     │
└─────────────────────────────────────┘
```

## Unit Tests

- **Location**: `src/**/*.spec.ts` (colocated with source)
- **Runner**: Jest
- **Coverage target**: 80%+ on services and utilities
- **Mocking**: Database calls, external services, and heavy dependencies

```typescript
describe('AuthService', () => {
  describe('login', () => {
    it('should return tokens for valid credentials', () => {
      // Arrange
      // Act
      // Assert
    });

    it('should throw UnauthorizedException for invalid password', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## Integration Tests

- **Location**: `tests/integration/` (directory lands in Phase 9 — no suites yet, so
  `pnpm test:integration` currently passes vacuously)
- **Purpose**: Verify service + database interaction
- **Database**: Dedicated test database (separate from dev/prod)
- **Setup**: Run migrations before tests, truncate tables between tests

```typescript
describe('CharactersService (Integration)', () => {
  it('should create character with generated readable ID', async () => {
    const character = await service.createCharacter(userId, dto);
    expect(character.readableId).toMatch(/^[A-Z][a-z]+/);
  });
});
```

## E2E Tests

- **Location**: `tests/e2e/`
- **Runner**: Jest + Supertest
- **Purpose**: Full HTTP request lifecycle testing
- **Setup**: Bootstrap the full NestJS app with test database

```typescript
describe('AuthController (E2E)', () => {
  it('POST /auth/register should create a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(validRegisterDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
  });
});
```

## Running Tests

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# All tests with coverage
pnpm test:cov

# Watch mode (development)
pnpm test:watch
```

## Suite Time Budgets

| Suite | Budget |
|-------|--------|
| Unit (`pnpm test`) | ~55s |
| E2E (`pnpm test:e2e`) | ~90s |

If a run blows past its budget, suspect a heavy dependency (DOM, native bindings, whole-`node_modules` transforms) — not "slow CI". See ADR-015 for the precedent.

## ESM Dependencies under Jest

`node_modules` is not transformed by default. If a suite fails with
`Unexpected token 'export'` (or `Cannot use import statement outside a module`)
naming a path under `node_modules/.pnpm/<pkg>@<version>/`, add `<pkg>@` to the
allowlist in `jest.config.js` — and to `tests/jest-e2e.json` /
`tests/jest-integration.json` only when `AppModule` loads that package.
Never set `transformIgnorePatterns: []` globally: transforming all of
`node_modules` explodes worker memory and suite time. See ADR-009, ADR-014, ADR-015.

## Reading CI Results

- Required checks must be green: Lint, Unit Tests, Integration & E2E, TDD & Migration Enforcement.
- `Coverage (informational)` failing is expected until Phase 9 completes (see `State.md`) — it does not block merges.
- When a required check fails, start from the job log: the first error block (exact file path, worker crash vs assertion vs timeout) determines the fix. A locally green suite plus CI red means environment difference (Node version, resources) — check `AGENTS.md` → Runtime first.
- Jest writes its entire report to **stderr**, not stdout, and may print a `worker failed to exit
  gracefully` warning. Neither one changes the exit code: trust the exit code, not the presence
  of stderr output.

## Test Commands in CI

These run in `.github/workflows/ci.yml` (jobs: Lint, Unit Tests, Integration & E2E).
`Coverage (informational)` runs `pnpm test:cov` separately and does not block merges.

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm db:migrate        # against the postgres:16-alpine service container
pnpm test:integration
pnpm test:e2e
```

## Test Data

- Use factories (not fixtures) for generating test data
- Each test creates and cleans up its own data
- Never depend on execution order
- No `faker` dependency: write explicit object literals inline (assertions compare against known values)
