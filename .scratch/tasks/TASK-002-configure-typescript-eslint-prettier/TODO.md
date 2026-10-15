# TASK-002: Configure TypeScript, ESLint, Prettier

## Objective
Set up code quality tools for consistent, clean code.

## Steps

1. Install ESLint and Prettier:
   - eslint, @eslint/js, typescript-eslint
   - prettier, eslint-config-prettier
   - eslint-plugin-prettier
2. Create eslint.config.js with TypeScript rules
3. Create .prettierrc with project conventions
4. Create .prettierignore
5. Add lint and format scripts to package.json
6. Configure tsconfig.json with:
   - strict: true
   - strictNullChecks
   - noImplicitAny
   - decorators enabled (experimentalDecorators, emitDecoratorMetadata)
7. Verify lint passes


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] `pnpm lint` passes with no errors
- [ ] `pnpm format` formats all files
- [ ] TypeScript strict mode is enabled
- [ ] ESLint recognizes NestJS decorators
