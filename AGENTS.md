# Git Workflow & Agent Guidelines

## Branching Strategy

| Rule | Detail |
|------|--------|
| `main` | Production — **NEVER** push, merge, or modify directly |
| `develop` | Integration branch — stable, always deployable |
| `feature/[tarea]` | One branch per task, deleted after squash merge |

## Workflow

```bash
# 1. Start a new task — create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/auth-jwt-implementation

# 2. Work with atomic, contextual conventional commits
git commit -m "feat(auth): add JWT access token generation"
git commit -m "fix(auth): handle expired refresh token edge case"

# 3. Task complete — squash merge to develop
git checkout develop
git pull origin develop
git merge --squash feature/auth-jwt-implementation

# 4. Commit on develop with detailed message
git commit -m "feat(auth): implement JWT authentication with refresh tokens

- Add login endpoint with access + refresh token pair
- Implement refresh token rotation (30-day expiry, hashed storage)
- Add logout (single session) and logout-all endpoints
- Add global guard for protected routes
- Add rate limiting on auth endpoints

Closes: AUTH-001"

# 5. Push and clean up
git push origin develop
git branch -d feature/auth-jwt-implementation
git push origin --delete feature/auth-jwt-implementation
```

## Conventional Commits Format

```
<type>(<scope>): <subject>

<body>

Closes: <issue/ticket>
```

### Types

| Type | Use When |
|------|----------|
| `feat` | New functionality |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `docs` | Documentation changes |
| `test` | Adding or updating tests |
| `chore` | Build, config, dependencies |
| `perf` | Performance improvement |
| `security` | Security-related changes |

### Scopes

`auth`, `users`, `characters`, `forums`, `topics`, `posts`, `friendships`, `reactions`, `moderation`, `admin`, `db`, `docker`, `config`

## TDD — Test-Driven Development (MANDATORY)

**Every task MUST follow the RED → GREEN → REFACTOR cycle. No exceptions.**

### The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

### Workflow per Task

1. **RED**: Write a failing test first
   - One behavior per test
   - Clear, descriptive name
   - Run test — verify it FAILS for the expected reason
2. **GREEN**: Write minimum code to pass the test
   - Simplest implementation that works
   - No extra features, no over-engineering
   - Run test — verify it PASSES
3. **REFACTOR**: Clean up while keeping tests green
   - Remove duplication
   - Improve names
   - Keep tests passing
4. **VERIFY**: Run full test suite
   - All tests pass (not just yours)
   - No regressions introduced

### Definition of Done

A task is **NOT** complete until:
- [ ] Tests were written BEFORE implementation
- [ ] Each test was verified to fail before implementing
- [ ] All tests pass
- [ ] No regressions in existing tests
- [ ] `TASKS.md` checkbox marked as `[x]`

### Red Flags — STOP and Start Over

- Code written before test
- Test passes immediately (you didn't watch it fail)
- "I'll test later" or "too simple to test"
- Skipping tests for "just this one time"

**All of these mean: Delete code. Start over with TDD.**

## Database Migrations

**MANDATORY whenever schema changes.**

- Every task that modifies the database schema (add/remove tables, columns, indexes, constraints) MUST generate a migration
- Use `pnpm db:generate` to create migration files (NEVER `db:push` for permanent changes)
- Migration files are committed in the SAME commit as the schema change
- Migration names follow Drizzle's automatic timestamp format
- If two features modify the same table, coordinate migration order before squash merge
- CI runs migrations on test database before running tests

## Code Standards

- **Language**: All code, comments, text, and documentation in **English**
- **Style**: ESLint + Prettier enforced
- **Testing**: TDD mandatory — RED → GREEN → REFACTOR for all features and bugfixes
- **Documentation**: Update relevant docs when changing behavior
- **Security**: **NEVER** commit passwords, API keys, JWT secrets, database credentials, or any sensitive data to the repository. Use `.env.example` with placeholder values only (e.g., `your-secret-key-change-in-production`). Real credentials must be injected at runtime via environment variables (CI/CD, Docker env_file), Docker secrets, or cloud provider secret managers (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault). `.env` files must be in `.gitignore`. Rotate secrets immediately if accidentally committed.

## Task Tracking

When a task is completed:
1. Mark the corresponding checkbox as `[x]` in `TASKS.md`
2. Update `State.md` with: current project status, last completed task, next pending task, and any context notes for the next session
3. Commit the updated `TASKS.md` and `State.md` on the feature branch before squash merge

Example commit: `chore(tasks): mark TASK-014 as completed and update project state`

## Strict Rules

1. **NEVER** modify `main` — no merges, no pushes, no PRs directly to main
2. **One task = one feature branch** — no mixing unrelated work
3. **Squash merge only** — no merge commits to develop
4. **Delete feature branches** after successful squash merge
5. **Atomic commits** — each commit is a coherent, logical change
6. **Contextual messages** — explain *why*, not just *what*
7. **Mark tasks as done** — update `TASKS.md` checkbox when a task is completed
8. **TDD always** — RED → GREEN → REFACTOR for every feature and bugfix, no exceptions
9. **Migrations mandatory** — Schema changes require `pnpm db:generate`, committed with the change
