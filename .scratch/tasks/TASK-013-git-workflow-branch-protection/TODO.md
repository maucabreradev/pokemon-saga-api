# TASK-013: Configure Git workflow and branch protection rules

## Objective
Initialize Git repository and set up branch protection rules.

## Steps

1. Initialize Git repository:
   ```bash
   git init
   git checkout -b main
   git checkout -b develop
   ```
2. Create initial commit on main with .gitignore
3. Create initial commit on develop
4. Push both branches to remote (GitHub/GitLab)
5. Set up branch protection rules (GitHub example):
   - `main`: Require PR reviews, no direct pushes, no force pushes
   - `develop`: Require PR reviews or squash merge from feature branches
6. Create .gitignore:
   - node_modules, dist, .env, coverage
   - IDE files (.idea, .vscode)
   - OS files (.DS_Store, Thumbs.db)
   - scratch files (.scratch/)
7. Create CONTRIBUTING.md referencing AGENTS.md
8. Verify workflow:
   - Create feature branch from develop
   - Make a commit
   - Squash merge to develop
   - Delete feature branch


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Git repo initialized with main and develop branches
- [ ] Branch protection rules active on remote
- [ ] .gitignore covers all sensitive/unnecessary files
- [ ] Feature branch workflow tested and working
- [ ] CONTRIBUTING.md created
