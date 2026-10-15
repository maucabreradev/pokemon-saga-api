# TASK-090: Add Swagger decorators to all endpoints

## Objective
Complete Swagger/OpenAPI documentation for all endpoints.

## Steps

1. Add @ApiTags() to all controllers
2. Add @ApiOperation() with summary and description to all endpoints
3. Add @ApiOkResponse() with schema examples
4. Add @ApiErrorResponse() for common error cases
5. Add @ApiParam() for path parameters
6. Add @ApiQuery() for query parameters
7. Add @ApiBody() with DTO schema for request bodies
8. Add @ApiBearerAuth() to protected endpoints
9. Verify Swagger UI shows all endpoints with correct schemas
10. Test "Try it out" functionality in Swagger UI


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] All endpoints documented in Swagger
- [ ] Request/response schemas visible
- [ ] Authentication documented
- [ ] Error responses documented
- [ ] "Try it out" works for all endpoints
- [ ] Documentation is accurate and complete
