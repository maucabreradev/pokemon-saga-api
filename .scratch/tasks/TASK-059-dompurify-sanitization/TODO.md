# TASK-059: Implement DOMPurify sanitization for topic/post bodies

## Objective
Sanitize HTML content in topics and posts to prevent XSS attacks.

## Steps

1. Install dompurify, jsdom
2. Create src/common/utils/html-sanitizer.ts:
   - Initialize DOMPurify with jsdom
   - Allowed tags: p, br, strong, em, u, s, a, ul, ol, li, blockquote, code, pre, img, h1-h6
   - Allowed attributes: href (a), src (img), alt (img)
   - All other HTML stripped
3. Create SanitizePipe:
   - Automatically sanitizes string fields in DTOs
   - Can be applied via @Pipe() or in service layer
4. Apply sanitization in:
   - Topic creation/editing
   - Post creation/editing
5. Test with malicious input:
   - `<script>alert('xss')</script>` → stripped
   - `<img onerror="alert(1)">` → onerror stripped
   - `<a href="javascript:alert(1)">` → href stripped
6. Unit tests


## TDD Steps (MANDATORY)

Follow RED -> GREEN -> REFACTOR before marking this task as complete:

1. [ ] **RED**: Write failing test first
2. [ ] **GREEN**: Write minimum code to pass the test
3. [ ] **REFACTOR**: Clean up while keeping tests green
4. [ ] **VERIFY**: All tests pass (full suite, not just yours)

See AGENTS.md for the full TDD workflow.

## Acceptance Criteria
- [ ] All HTML content sanitized before storage
- [ ] Script tags completely removed
- [ ] Event handlers (onerror, onclick, etc.) stripped
- [ ] JavaScript URLs removed from href/src
- [ ] Safe HTML (bold, italic, links, lists) preserved
- [ ] All existing tests pass with sanitized content
