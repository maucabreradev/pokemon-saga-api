import { sanitizeHtml } from './sanitize-html';

describe('sanitizeHtml', () => {
  it('should strip script tags while keeping text content', () => {
    // Arrange
    const dirty = '<script>alert("xss")</script><p>Hello</p>';

    // Act
    const clean = sanitizeHtml(dirty);

    // Assert
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('Hello');
  });

  it('should remove event handler attributes', () => {
    // Arrange
    const dirty = '<img src="x" onerror="alert(1)">';

    // Act
    const clean = sanitizeHtml(dirty);

    // Assert
    expect(clean).not.toContain('onerror');
  });

  it('should remove javascript: URLs from links', () => {
    // Arrange
    const dirty = '<a href="javascript:alert(1)">Click</a>';

    // Act
    const clean = sanitizeHtml(dirty);

    // Assert
    expect(clean).not.toContain('javascript:');
    expect(clean).not.toContain('href');
    expect(clean).toContain('Click');
  });

  it('should remove javascript: URLs from image sources', () => {
    // Arrange
    const dirty = '<img src="javascript:alert(1)" alt="x">';

    // Act
    const clean = sanitizeHtml(dirty);

    // Assert
    expect(clean).not.toContain('javascript:');
    expect(clean).toContain('alt="x"');
  });

  it('should preserve the allowed formatting tags', () => {
    // Arrange
    const dirty =
      '<p><strong>Bold</strong> <em>italic</em> <u>under</u> <s>strike</s> <code>code</code></p>';

    // Act
    const clean = sanitizeHtml(dirty);

    // Assert
    expect(clean).toContain('<strong>Bold</strong>');
    expect(clean).toContain('<em>italic</em>');
    expect(clean).toContain('<u>under</u>');
    expect(clean).toContain('<s>strike</s>');
    expect(clean).toContain('<code>code</code>');
  });

  it('should preserve links and lists', () => {
    // Arrange
    const dirty = '<a href="https://example.com">Link</a><ul><li>One</li><li>Two</li></ul>';

    // Act
    const clean = sanitizeHtml(dirty);

    // Assert
    expect(clean).toContain('<a href="https://example.com">Link</a>');
    expect(clean).toContain('<li>One</li>');
    expect(clean).toContain('<li>Two</li>');
  });

  it('should strip tags outside the allowlist while keeping their text', () => {
    // Arrange
    const dirty = '<div><b>Bold</b> text</div>';

    // Act
    const clean = sanitizeHtml(dirty);

    // Assert
    expect(clean).not.toContain('<div');
    expect(clean).not.toContain('<b>');
    expect(clean).toContain('Bold');
    expect(clean).toContain('text');
  });

  it('should keep href on links and strip other attributes', () => {
    // Arrange
    const dirty = '<a href="https://example.com" target="_blank">Link</a>';

    // Act
    const clean = sanitizeHtml(dirty);

    // Assert
    expect(clean).toContain('href="https://example.com"');
    expect(clean).not.toContain('target');
  });

  it('should keep src and alt on images and strip other attributes', () => {
    // Arrange
    const dirty = '<img src="https://example.com/p.png" alt="pic" title="hover">';

    // Act
    const clean = sanitizeHtml(dirty);

    // Assert
    expect(clean).toContain('src="https://example.com/p.png"');
    expect(clean).toContain('alt="pic"');
    expect(clean).not.toContain('title');
  });

  it('should return an empty string for empty input', () => {
    expect(sanitizeHtml('')).toBe('');
  });
});
