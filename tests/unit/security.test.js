/**
 * Unit Tests for Security Utilities
 */

const SecurityUtils = require('../../sites/shared/assets/utils/security.js');

describe('SecurityUtils', () => {
  describe('sanitizeInput', () => {
    test('should escape HTML characters', () => {
      const input = '<script>alert("XSS")</script>';
      const output = SecurityUtils.sanitizeInput(input);
      expect(output).toContain('&lt;script&gt;');
    });

    test('should return empty string if falsy', () => {
      expect(SecurityUtils.sanitizeInput(null)).toBe('');
      expect(SecurityUtils.sanitizeInput('')).toBe('');
    });
    
    test('should convert non-string to string', () => {
      expect(SecurityUtils.sanitizeInput(123)).toBe('123');
    });
  });

  describe('isValidURL', () => {
    test('should validate http and https URLs', () => {
      expect(SecurityUtils.isValidURL('https://google.com')).toBe(true);
      expect(SecurityUtils.isValidURL('http://test.com')).toBe(true);
      expect(SecurityUtils.isValidURL('mailto:test@test.com')).toBe(true);
    });

    test('should return false for invalid URLs', () => {
      expect(SecurityUtils.isValidURL('javascript:alert(1)')).toBe(false);
      expect(SecurityUtils.isValidURL('not a url')).toBe(false);
    });
  });

  describe('safeSetText', () => {
    test('should set text content safely', () => {
      const el = document.createElement('div');
      SecurityUtils.safeSetText(el, '<b>test</b>');
      expect(el.textContent).toBe('&lt;b&gt;test&lt;/b&gt;');
    });
    
    test('should do nothing if element is null', () => {
      expect(() => SecurityUtils.safeSetText(null, 'test')).not.toThrow();
    });
  });

  describe('safeSetAttribute', () => {
    test('should set safe attributes', () => {
      const el = document.createElement('div');
      SecurityUtils.safeSetAttribute(el, 'title', 'Safe Title');
      expect(el.getAttribute('title')).toBe('Safe Title');
    });

    test('should block dangerous href values', () => {
      const el = document.createElement('a');
      SecurityUtils.safeSetAttribute(el, 'href', 'javascript:alert(1)');
      expect(el.hasAttribute('href')).toBe(false);
    });
  });

  describe('validateInput', () => {
    test('should validate email format', () => {
      const input = document.createElement('input');
      input.type = 'email';
      input.value = 'invalid';
      expect(SecurityUtils.validateInput(input).valid).toBe(false);
      
      input.value = 'valid@example.com';
      expect(SecurityUtils.validateInput(input).valid).toBe(true);
    });

    test('should handle null input', () => {
      expect(SecurityUtils.validateInput(null).valid).toBe(false);
    });
    
    test('should validate required fields', () => {
      const input = document.createElement('input');
      input.setAttribute('required', '');
      input.value = '';
      expect(SecurityUtils.validateInput(input).valid).toBe(false);
    });
  });
});
