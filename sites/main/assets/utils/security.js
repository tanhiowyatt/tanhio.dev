/**
 * Security Utilities
 * Provides security-related helper functions
 */

(function () {
  'use strict';

  /**
   * Sanitizes user input to prevent XSS
   * @param {string} input - User input string
   * @returns {string} - Sanitized string
   */
  function sanitizeInput(input) {
    if (typeof input !== 'string') {
      return String(input);
    }

    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return input.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Validates URL to ensure it's safe
   * @param {string} url - URL to validate
   * @returns {boolean} - True if URL is safe
   */
  function isValidURL(url) {
    try {
      const baseURL = (typeof window !== 'undefined' && window.location)
        ? window.location.origin
        : 'http://localhost';
      const parsed = new URL(url, baseURL);
      // Only allow http, https, and mailto protocols
      return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
    } catch (e) {
      return false;
    }
  }

  /**
   * Safely sets text content (prevents XSS)
   * @param {Element} element - DOM element
   * @param {string} text - Text to set
   */
  function safeSetText(element, text) {
    if (!element) return;
    element.textContent = sanitizeInput(text);
  }

  /**
   * Safely sets attribute (prevents XSS)
   * @param {Element} element - DOM element
   * @param {string} name - Attribute name
   * @param {string} value - Attribute value
   */
  function safeSetAttribute(element, name, value) {
    if (!element) return;

    // Sanitize value for dangerous attributes
    if (name === 'href' || name === 'src') {
      if (!isValidURL(value)) {
        console.warn('Invalid URL prevented:', value);
        return;
      }
    }

    element.setAttribute(name, sanitizeInput(value));
  }

  /**
   * Validates form input
   * @param {HTMLInputElement|HTMLTextAreaElement} input - Form input element
   * @returns {Object} - { valid: boolean, error: string }
   */
  function validateInput(input) {
    if (!input) {
      return { valid: false, error: 'Input element is required' };
    }

    const value = input.value || '';
    const type = input.type || 'text';
    const required = input.hasAttribute('required');

    // Check required fields
    if (required && !value.trim()) {
      return { valid: false, error: 'This field is required' };
    }

    // Email validation
    if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, error: 'Invalid email format' };
      }
    }

    // Check for potentially dangerous content
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(value)) {
        return { valid: false, error: 'Invalid input detected' };
      }
    }

    return { valid: true, error: null };
  }

  // Create the SecurityUtils object
  const SecurityUtils = {
    sanitizeInput,
    isValidURL,
    safeSetText,
    safeSetAttribute,
    validateInput
  };

  // Export for use in browser
  if (typeof window !== 'undefined') {
    window.SecurityUtils = SecurityUtils;
  }

  // Export for Node.js/testing
  if (typeof global !== 'undefined') {
    global.SecurityUtils = SecurityUtils;
  }

  // Export for CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityUtils;
  }
})();

