import DOMPurify from 'isomorphic-dompurify';

/**
 * Shared HTML sanitizer for user-generated content (topics, posts).
 * TASK-059 reuses and hardens this primitive for post bodies.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty);
}
