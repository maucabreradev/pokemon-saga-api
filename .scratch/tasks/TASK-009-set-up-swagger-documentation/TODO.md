# TASK-009: Set up Swagger/OpenAPI documentation

## Objective
Configure Swagger for interactive API documentation.

## Steps

1. Install @nestjs/swagger, swagger-ui-express
2. Create src/config/swagger.config.ts:
   - API title, description, version
   - Bearer auth configuration
   - Server URLs (development, production)
3. Initialize Swagger in main.ts:
   - Create DocumentBuilder config
   - Setup Swagger UI at /api/docs
   - Add bearer auth to document
4. Create common decorators:
   - @ApiOkResponseWithSchema() — standardized success response
   - @ApiErrorResponse() — standardized error response
5. Add basic Swagger config to main app module
6. Verify Swagger UI loads at /api/docs


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] Swagger UI accessible at /api/docs
- [ ] Document title and description are correct
- [ ] Bearer token authentication is configured
- [ ] All endpoints appear in documentation (once controllers are added)
- [ ] Request/response schemas are documented
