import sanitizeHtmlLib, { IOptions } from 'sanitize-html';

/**
 * Shared HTML sanitizer for user-generated content (topics, posts).
 * sanitize-html (htmlparser2, no DOM) replaced the DOMPurify/jsdom chain,
 * which crashed at runtime on Node 20 via undici ESM — see ADR-015.
 *
 * TASK-059: the allowlist is explicit instead of the library defaults, which
 * diverge from the product spec — the installed version does not even allow
 * `img` by default (images were stripped entirely) while letting through
 * tags and attributes the forum does not want (div, span, tables, target).
 */
const OPTIONS: IOptions = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    's',
    'a',
    'ul',
    'ol',
    'li',
    'blockquote',
    'code',
    'pre',
    'img',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
  ],
  allowedAttributes: {
    a: ['href'],
    img: ['src', 'alt'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
};

export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, OPTIONS);
}
