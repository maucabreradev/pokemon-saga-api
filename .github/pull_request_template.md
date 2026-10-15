## Summary

<!-- What does this PR change and why? -->

## Task

Closes: TASK-XXX

## TDD Checklist

- [ ] Failing test written first (RED) and verified to fail for the expected reason
- [ ] Minimal implementation to pass (GREEN)
- [ ] Refactored with tests green (REFACTOR)
- [ ] Full suite passes with no regressions (`pnpm test`, `pnpm test:integration`, `pnpm test:e2e`)

## Migration Checklist (if schema changed)

- [ ] `pnpm db:generate` run and migration committed with the change
- [ ] No use of `db:push` for permanent changes

## Workflow Checklist

- [ ] Branch created from `develop` as `feature/<task>`
- [ ] Atomic conventional commits
- [ ] `TASKS.md` checkbox updated
- [ ] `State.md` updated (status, last completed, next task, context)
