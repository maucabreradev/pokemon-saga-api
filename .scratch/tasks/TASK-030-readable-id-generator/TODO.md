# TASK-030: Implement human-readable ID generator

## Objective
Generate unique, human-readable IDs for characters (e.g., "GreenAppleHunter123").

## Steps

1. Create src/common/utils/readable-id-generator.ts:
   - Word lists: adjectives (Green, Shadow, Crimson, Azure, Golden...)
   - Nouns (Apple, Wolf, Hunter, Dragon, Phoenix...)
   - Verbs (Running, Flying, Striking, Roaring, Dancing...)
   - Number suffix: 1-9999
2. Generation algorithm:
   - Random combination: `[Adjective][Noun][Verb][Number]`
   - Check uniqueness against characters.readable_id
   - Retry up to 5 times if collision
   - Throw if all retries exhausted
3. Also support custom readable_id validation:
   - 3-32 characters
   - Alphanumeric only (no spaces, no special chars except underscore)
   - Must start with a letter
4. Unit tests:
   - Generation produces expected format
   - Collision handling works
   - Custom ID validation works


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Generated IDs match pattern: CapitalizedWords + Number
- [ ] IDs are unique (collision detection)
- [ ] Retry logic handles rare collisions
- [ ] Custom IDs validated properly
- [ ] Performance: generation < 50ms average
