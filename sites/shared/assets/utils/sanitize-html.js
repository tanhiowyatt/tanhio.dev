
'use strict';

const ALLOWED_TAGS = [
  'p', 'a', 'img',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'strong', 'em', 'code', 'pre', 'blockquote',
  'br', 'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'span', 'div', 'section', 'article', 'footer'
];

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title',
  'target', 'rel',
  'class', 'id'
];

/**
 * Sanitize an HTML string and return a sanitized string.
 */
function sanitizeHTML(html, extraConfig) {
  if (typeof html !== 'string') {
    return '';
  }

  // DOMPurify — primary path (loaded via vendor script)
  if (globalThis?.DOMPurify) {
    const config = extraConfig || {
      ALLOWED_TAGS: ALLOWED_TAGS,
      ALLOWED_ATTR: ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false
    };
    return globalThis.DOMPurify.sanitize(html, config);
  }

  // Fallback: Sanitizer API
  if (globalThis?.Sanitizer) {
    const allowAttributes = ALLOWED_ATTR.reduce((acc, name) => {
      acc[name] = ALLOWED_TAGS;
      return acc;
    }, {});

    const sanitizer = new globalThis.Sanitizer({
      allowElements: ALLOWED_TAGS,
      allowAttributes,
      allowCustomElements: false,
      ...extraConfig
    });

    const tmp = document.createElement('div');
    tmp.setHTML(html, { sanitizer });
    return tmp.innerHTML;
  }

  // Safe text-only fallback
  const tmp = document.createElement('div');
  tmp.textContent = html;
  return tmp.innerHTML;
}

/**
 * Safely set HTML via DOMParser + append().
 */
function setSafeHTML(element, html, extraConfig) {
  if (!element) return;

  if (extraConfig?._isSanitized) {
    element.innerHTML = html;
    return;
  }

  const sanitized = sanitizeHTML(html, extraConfig);
  element.innerHTML = sanitized;
}

/**
 * Sanitize HTML produced from Markdown.
 */
function sanitizeMarkdownHTML(html) {
  const markdownConfig = {
    ALLOWED_TAGS: [...ALLOWED_TAGS, 'span', 'div'],
    ALLOWED_ATTR: [...ALLOWED_ATTR, 'data-line', 'data-img-src'],
    ALLOW_DATA_ATTR: true
  };
  return sanitizeHTML(html, markdownConfig);
}

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, (m) => map[m]);
}

const SanitizeHTML = {
  sanitizeHTML,
  setSafeHTML,
  sanitizeMarkdownHTML,
  escapeHTML
};

if (typeof globalThis !== 'undefined') {
  globalThis.SanitizeHTML = SanitizeHTML;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SanitizeHTML;
}

if (typeof document !== 'undefined' && !globalThis.__TEST__) {
  // Initialization logic if needed
}
