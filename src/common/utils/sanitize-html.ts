import sanitizeHtmlLib from 'sanitize-html';

/**
 * Shared HTML sanitizer for user-generated content (topics, posts).
 * sanitize-html (htmlparser2, no DOM) replaced the DOMPurify/jsdom chain,
 * which crashed at runtime on Node 20 via undici ESM — see ADR-015.
 * TASK-059 reuses and hardens this primitive for post bodies.
 */
export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty);
}
