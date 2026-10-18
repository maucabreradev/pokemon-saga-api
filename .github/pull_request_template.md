## Summary

<!-- What does this PR change and why? -->

## Task

Closes: TASK-XXX (or Refs: FIX-XXX for maintenance work)

## TDD Checklist

- [ ] Failing test written first (RED) and verified to fail for the expected reason
- [ ] Minimal implementation to pass (GREEN)
- [ ] Refactored with tests green (REFACTOR)
- [ ] Full suite passes with no regressions (`pnpm test`, `pnpm test:integration`, `pnpm test:e2e`)
- [ ] Docs-only / config-only PR: the items above are N/A (state why in the summary)

## Migration Checklist (if schema changed)

- [ ] `pnpm db:generate` run and migration committed with the change
- [ ] No use of `db:push` for permanent changes

## Workflow Checklist

- [ ] Branch created from `develop` as `feature/task-NNN-<slug>` (or `feature/fix-NNN-<slug>`)
- [ ] Atomic conventional commits; the doc commit is the **last** commit on the branch
- [ ] `TASKS.md` checkbox flipped to `[x]` for the task (task branches)
- [ ] `State.md` fully refreshed — `TDD & Migration Enforcement` fails the PR otherwise:
  - [ ] `Last updated` date and `Current phase` line
  - [ ] `Verification` block (commands, suite/test counts, exit codes)
  - [ ] `Current Status` paragraph
  - [ ] `Last Completed` entry and `Recent Activity` row
  - [ ] `Context for Next Session` notes
- [ ] Squash subject keeps the automatic `(#NN)` suffix (do not edit it in the UI) so the commit stays linked to its PR
