# Git Workflow & Agent Guidelines

## Branching Strategy

| Rule | Detail |
|------|--------|
| `main` | Production — **NEVER** push, merge, or modify directly |
| `develop` | Integration branch — stable, always deployable |
| `feature/task-NNN-<slug>` | One branch per task (`feature/fix-NNN-<slug>` for maintenance), opened as a PR into `develop`, deleted after squash merge |

## Workflow

```bash
# 1. Start a new task — create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/task-060-list-friendships

# 2. Work with atomic, contextual conventional commits
git commit -m "feat(friendships): add friendship list query"
git commit -m "test(friendships): cover the status filter and the no-character case"

# 3. Task complete — refresh the journal and commit it LAST
#    TASKS.md checkbox -> [x]; State.md: every section (see Task Tracking)
git commit -m "chore(tasks): mark TASK-060 as completed and update project state"

# 4. Push the branch and open a PR into develop
git push -u origin feature/task-060-list-friendships
# Open the PR in the GitHub UI (or: gh pr create --base develop)

# 5. The PR title becomes the squash subject and the PR body becomes the
#    commit body, so write them as the final commit you want on develop.
#    Do NOT edit the squash subject in the UI: keep the "(#NN)" suffix it
#    gets automatically, so the commit stays linked to its PR:
#
#    feat(friendships): implement GET /friendships (#60)
#
#    - Add friendships module with the list endpoint
#    - Filter by status (pending, accepted, blocked)
#    - Return the friend's readableId, public name, avatar, and createdAt
#
#    Closes: TASK-060

# 6. Wait for the required checks, squash merge from the GitHub UI,
#    let the UI delete the branch, then sync locally
git checkout develop
git pull origin develop
git fetch --prune
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
- [ ] `State.md` refreshed — every section listed in Task Tracking

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
- **Runtime**: Dev, CI, and production all run Node 24 (pinned in `Dockerfile`, `.github/workflows/ci.yml`, `.nvmrc` and `package.json` → `engines`). Every new dependency must support Node 24 — a package working locally on a newer Node proves nothing.

## Adding Dependencies

Before running `pnpm add`, verify the dependency against this checklist:

- **Engines**: Declares support for Node 24 (`engines` field or documented compatibility)
- **Module format**: CJS preferred. ESM-only packages require Jest allowlist updates (see `TESTING.md` → ESM dependencies under Jest) — avoid them in hot paths
- **Builds**: No postinstall scripts or native builds. If unavoidable, add to `allowBuilds` in `pnpm-workspace.yaml` (required for `pnpm install --frozen-lockfile` in CI)
- **Weight**: No `jsdom`, `canvas`, or binary-transitive chains in API runtime code — they break boot on pinned Node and explode suite time (see ADR-015)
- **Commit**: `package.json` + `pnpm-lock.yaml` changes ride in the SAME feature commit as the code using them

## Task Tracking

Completing a task is not finished until the project journal is updated. The CI
job `TDD & Migration Enforcement` enforces this: any PR whose diff does not touch
`State.md` fails, and a `feature/task-NNN-*` branch additionally must update
`TASKS.md` (with `- [x] **TASK-NNN**`) and mention `TASK-NNN` in `State.md`.

When a task is completed:
1. Mark the corresponding checkbox as `[x]` in `TASKS.md` (task branches)
2. Refresh `State.md` — every section, in this order:
   - `Last updated` date
   - `Current phase` line (phase status + next task)
   - `Verification` block (commands, suite/test counts, exit codes, branch/commit)
   - `Current Status` paragraph (what changed and why)
   - `Last Completed` entry (newest first; prune so the list stays readable)
   - `Recent Activity` row (date, task, one-line summary)
   - `Context for Next Session` notes (add what the next session must know; delete stale notes)
3. Commit `TASKS.md` and `State.md` as the **last commit on the branch**, before
   opening or updating the PR, so the squash carries the journal with the code

Example commit: `chore(tasks): mark TASK-060 as completed and update project state`

## Strict Rules

1. **NEVER** modify `main` — no merges, no pushes, no PRs directly to main
2. **One task = one feature branch** — no mixing unrelated work
3. **Squash merge only** — no merge commits to develop (PR into `develop`, squash merged from the GitHub UI)
4. **Delete feature branches** after successful squash merge
5. **Atomic commits** — each commit is a coherent, logical change
6. **Contextual messages** — explain *why*, not just *what*
7. **Mark tasks as done** — update `TASKS.md` checkbox when a task is completed
8. **TDD always** — RED → GREEN → REFACTOR for every feature and bugfix, no exceptions
9. **Migrations mandatory** — Schema changes require `pnpm db:generate`, committed with the change
10. **Update the journal** — every PR must touch `State.md`; `TDD & Migration Enforcement` fails the PR otherwise
