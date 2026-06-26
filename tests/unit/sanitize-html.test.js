/**
 * Unit Tests for SanitizeHTML Utility
 */

globalThis.__TEST__ = true;

const SanitizeHTML = require('../../sites/main/assets/utils/sanitize-html.js');

describe('SanitizeHTML', () => {
  beforeEach(() => {
    delete globalThis.DOMPurify;
    delete globalThis.Sanitizer;
    jest.restoreAllMocks();
  });

  describe('sanitizeHTML', () => {
    test('should handle non-string input', () => {
      expect(SanitizeHTML.sanitizeHTML(null)).toBe('');
    });

    test('should use Sanitizer API if available', () => {
      // Mock Sanitizer API
      const mockSanitizer = jest.fn().mockImplementation(() => ({
        // Sanitizer config
      }));
      globalThis.Sanitizer = mockSanitizer;
      
      // Mock element.setHTML
      const originalSetHTML = Element.prototype.setHTML;
      Element.prototype.setHTML = jest.fn(function(html) {
        this.innerHTML = 'sanitized';
      });

      const output = SanitizeHTML.sanitizeHTML('<b>test</b>');
      expect(output).toBe('sanitized');
      expect(Element.prototype.setHTML).toHaveBeenCalled();

      // Cleanup
      Element.prototype.setHTML = originalSetHTML;
    });

    test('should use DOMPurify if available', () => {
      globalThis.DOMPurify = {
        sanitize: jest.fn().mockReturnValue('purified')
      };
      const output = SanitizeHTML.sanitizeHTML('<b>test</b>');
      expect(output).toBe('purified');
      expect(globalThis.DOMPurify.sanitize).toHaveBeenCalled();
    });

    test('should escape tags in fallback mode', () => {
      const output = SanitizeHTML.sanitizeHTML('<b>Bold</b>');
      expect(output).toBe('&lt;b&gt;Bold&lt;/b&gt;');
    });
  });

  describe('setSafeHTML', () => {
    test('should use DOMParser when available', () => {
      const el = document.createElement('div');
      SanitizeHTML.setSafeHTML(el, '<span>test</span>');
      expect(el.innerHTML).toBe('&lt;span&gt;test&lt;/span&gt;');
    });
    
    test('should skip sanitization if flag is set', () => {
      const el = document.createElement('div');
      SanitizeHTML.setSafeHTML(el, '<b>raw</b>', { _isSanitized: true });
      expect(el.innerHTML).toBe('<b>raw</b>');
    });
  });
});
