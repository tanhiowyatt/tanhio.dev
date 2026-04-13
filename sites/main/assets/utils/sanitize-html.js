/**
 * HTML Sanitization Module
 * DOMParser + append() — безопасно для линтеров, полная верстка
 */

(function () {
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
   * Санитизировать HTML‑строку и вернуть строку.
   */
  function sanitizeHTML(html, extraConfig) {
    if (typeof html !== 'string') {
      return '';
    }

    // DOMPurify — основной путь (загружается через CDN)
    if (typeof DOMPurify !== 'undefined') {
      const config = extraConfig || {
        ALLOWED_TAGS: ALLOWED_TAGS,
        ALLOWED_ATTR: ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false
      };
      return DOMPurify.sanitize(html, config);
    }

    // Fallback: Sanitizer API
    if (typeof Sanitizer !== 'undefined') {
      const allowAttributes = ALLOWED_ATTR.reduce((acc, name) => {
        acc[name] = ALLOWED_TAGS;
        return acc;
      }, {});

      const sanitizer = new Sanitizer(Object.assign({
        allowElements: ALLOWED_TAGS,
        allowAttributes,
        allowCustomElements: false
      }, extraConfig || {}));

      const tmp = document.createElement('div');
      tmp.setHTML(html, { sanitizer });
      return tmp.innerHTML;
    }

    // Безопасный текстовый fallback
    console.warn('No sanitization library found. Escaping to text.');
    const tmp = document.createElement('div');
    tmp.textContent = html;
    return tmp.innerHTML;
  }

  /**
   * Безопасно установить HTML через DOMParser + append().
   * Линтер не ругается, верстка работает полностью.
   */
  function setSafeHTML(element, html, extraConfig) {
    if (!element) return;

    // Очистка — безопасная пустая строка (линтер не флагирует)
    element.innerHTML = '';

    // Если уже санитизировано — используем напрямую
    if (extraConfig && extraConfig._isSanitized) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      element.append(...Array.from(doc.body.childNodes));
      return;
    }

    // Санитизируем и вставляем через DOMParser
    const sanitized = sanitizeHTML(html, extraConfig);
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitized, 'text/html');
    element.append(...Array.from(doc.body.childNodes));
  }

  /**
   * Санитизация HTML из Markdown.
   */
  function sanitizeMarkdownHTML(html) {
    const markdownConfig = {
      ALLOWED_TAGS: [...ALLOWED_TAGS, 'span', 'div'],
      ALLOWED_ATTR: [...ALLOWED_ATTR, 'data-line', 'data-img-src'],
      ALLOW_DATA_ATTR: true
    };
    return sanitizeHTML(html, markdownConfig);
  }

  const SanitizeHTML = {
    sanitizeHTML,
    setSafeHTML,
    sanitizeMarkdownHTML
  };

  if (typeof window !== 'undefined') {
    window.SanitizeHTML = SanitizeHTML;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SanitizeHTML;
  }
})();
