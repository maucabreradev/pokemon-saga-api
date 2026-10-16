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

  it('should preserve basic formatting tags', () => {
    // Arrange
    const dirty = '<p><b>Bold</b> and <i>italic</i></p>';

    // Act
    const clean = sanitizeHtml(dirty);

    // Assert
    expect(clean).toContain('<b>Bold</b>');
    expect(clean).toContain('<i>italic</i>');
  });

  it('should return an empty string for empty input', () => {
    expect(sanitizeHtml('')).toBe('');
  });
});
