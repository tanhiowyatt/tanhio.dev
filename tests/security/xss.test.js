/**
 * XSS Protection Tests
 */

const SecurityUtils = require('../../sites/main/assets/utils/security.js');

describe('XSS Protection Tests', () => {
  test('should prevent script injection via textContent', () => {
    const div = document.createElement('div');
    const maliciousInput = '<script>alert("xss")</script>';
    
    div.textContent = maliciousInput;
    expect(div.innerHTML).not.toContain('<script>');
  });

  test('should sanitize user input', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = SecurityUtils.sanitizeInput(maliciousInput);
    expect(sanitized).not.toContain('<script>');
  });

  test('should validate URLs before setting href', () => {
    const link = document.createElement('a');
    const maliciousURL = 'javascript:alert(1)';
    
    const isValid = SecurityUtils.isValidURL(maliciousURL);
    expect(isValid).toBe(false);
  });

  test('should prevent dangerous input in forms', () => {
    const input = document.createElement('input');
    input.value = '<script>alert("xss")</script>';
    
    const result = SecurityUtils.validateInput(input);
    expect(result.valid).toBe(false);
  });
});
