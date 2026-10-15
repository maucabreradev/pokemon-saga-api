# TASK-001: Initialize NestJS project with pnpm

## Objective
Set up a new NestJS project using pnpm as the package manager.

## Steps

1. Create package.json with pnpm
2. Install NestJS core dependencies:
   - @nestjs/core, @nestjs/common, @nestjs/platform-express
   - rxjs, reflect-metadata
3. Install development dependencies:
   - typescript, @types/node, @types/express
   - ts-node, tsconfig-paths
   - @nestjs/cli, @nestjs/schematics
   - jest, @nestjs/testing, @types/jest
4. Create tsconfig.json with strict mode
5. Create nest-cli.json
6. Create basic src/main.ts with NestFactory
7. Create src/app.module.ts
8. Verify project compiles and runs


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] `pnpm install` completes without errors
- [ ] `pnpm dev` starts the server on port 3000
- [ ] `pnpm build` produces dist/ output
- [ ] Basic GET / endpoint returns 200 OK
