# Branch Protection (Option A — Manual via GitHub UI)

`main` is production and is never modified directly. `develop` is the integration
branch and is always deployable. Every change lands via `feature/<task>` branch
with squash merge into `develop`.

## Rules for `main`

Apply in GitHub: Settings > Branches > Add branch protection rule > Branch name pattern `main`.

- Require a pull request before merging
  - Required approvals: 1
  - Dismiss stale pull request approvals when new commits are pushed
  - Require review from Code Owners
- Require status checks to pass before merging
  - Require branches to be up to date before merging
  - Required checks: `Lint`, `Unit Tests`, `Integration & E2E Tests`, `TDD & Migration Enforcement`
  - `Coverage (informational)` is NOT required (expected to fail until Phase 9 per ADR-010; signal, not gate)
- Require linear history (squash merge only, no merge commits)
- Include administrators
- Do not allow bypassing the above settings
- Restrict deletions and force pushes (do not allow)

## Rules for `develop`

Apply in GitHub: Settings > Branches > Add branch protection rule > Branch name pattern `develop`.

- Require a pull request before merging
  - Required approvals: 0 (solo developer: the author cannot approve their own PR, so no approval can be required on `develop`; keep 1 approval on `main`)
  - Dismiss stale pull request approvals when new commits are pushed
- Require status checks to pass before merging
  - Require branches to be up to date before merging
  - Required checks: `Lint`, `Unit Tests`, `Integration & E2E Tests`, `TDD & Migration Enforcement`
  - `Coverage (informational)` is NOT required (expected to fail until Phase 9 per ADR-010; signal, not gate)
- Require linear history (squash merge only, no merge commits)
- Include administrators
- Do not allow bypassing the above settings
- Restrict deletions and force pushes (do not allow)

## Workflow Reminder

See `AGENTS.md` for the full workflow: feature branch from `develop`,
atomic conventional commits, squash merge into `develop`, push `develop`,
delete the feature branch. `TASKS.md` and `State.md` are updated on every task.
CI runs on `push` and `pull_request` for both `main` and `develop`
(see `.github/workflows/ci.yml`).
